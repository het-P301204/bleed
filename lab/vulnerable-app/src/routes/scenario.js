'use strict';
const express = require('express');
const router = express.Router();

const { capturePrototypeState, diffPrototypeStates, restorePrototype, buildObjectState } = require('../lib/state-tracker');
const { deepMerge } = require('../sources/recursive-merge');
const { mergeConfig } = require('../sources/unsafe-merge');
const { setByPath } = require('../sources/deep-parser');
const { buildConfig } = require('../sources/config-merge');
const { applyOptions } = require('../sources/property-assign');
const { normalizeQuery } = require('../sources/query-normalize');
const { makeRequest, makeRequestWithInheritedHeaders } = require('../gadgets/axios-client');
const { checkAuthorization } = require('../gadgets/auth-check');
const { traverseObject } = require('../gadgets/callback-traversal');

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function genEvent(type, relativeMs, description, extras) {
  return {
    id: genId(),
    type,
    timestamp: Date.now(),
    relativeMs,
    description,
    ...extras,
  };
}

// Serialize requests so Object.prototype pollution doesn't bleed across runs
let running = false;
const queue = [];

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    drain();
  });
}

function drain() {
  if (running || queue.length === 0) return;
  running = true;
  const { fn, resolve, reject } = queue.shift();
  Promise.resolve()
    .then(fn)
    .then(resolve, reject)
    .finally(() => {
      running = false;
      drain();
    });
}

// Execute the appropriate pollution source
function executeSource(sourceId, payload, property) {
  switch (sourceId) {
    case 'src-recursive-merge':
      deepMerge({}, payload);
      break;
    case 'src-unsafe-merge':
      mergeConfig({}, payload);
      break;
    case 'src-deep-parser': {
      // Extract value from payload: prefer payload[property], then payload.value, then payload itself
      let value;
      if (payload && typeof payload === 'object' && property in payload) {
        value = payload[property];
      } else if (payload && typeof payload === 'object' && 'value' in payload) {
        value = payload.value;
      } else {
        value = payload;
      }
      setByPath({}, `__proto__.${property}`, value);
      break;
    }
    case 'src-config-merge':
      buildConfig({}, payload);
      break;
    case 'src-property-assign':
      applyOptions({}, payload);
      break;
    case 'src-query-normalize':
      normalizeQuery({}, payload);
      break;
    default:
      throw new Error(`Unknown sourceId: ${sourceId}`);
  }
}

// Trigger the gadget for the given labTarget
async function triggerGadget(labTarget, property) {
  switch (labTarget) {
    case 'http-sim': {
      const result = await makeRequest('/bleed-probe');
      return {
        triggered: result.baseURLInherited === true || result.status === 200,
        impactReproduced: result.status === 200 && !result.error,
        response: result,
        impact: 'SYNTHETIC_SSRF',
        description: 'axios request used inherited baseURL from Object.prototype',
      };
    }
    case 'auth-sim': {
      const user = {};
      const result = checkAuthorization(user);
      return {
        triggered: result.inherited,
        impactReproduced: result.authorized && result.inherited,
        response: result,
        impact: 'SYNTHETIC_AUTH_BYPASS',
        description: 'auth check read role/isAdmin from polluted Object.prototype',
      };
    }
    case 'metadata-sim': {
      const result = await makeRequestWithInheritedHeaders('/credentials');
      return {
        triggered: result.headersInjected === true || result.status === 200,
        impactReproduced: result.status === 200 && !result.error,
        response: result,
        impact: 'SYNTHETIC_CREDENTIAL_FLOW',
        description: 'HTTP request carried headers inherited from Object.prototype',
      };
    }
    case 'execution-sim': {
      const result = traverseObject({});
      return {
        triggered: result.executionMarkerReached,
        impactReproduced: result.executionMarkerReached,
        response: result,
        impact: 'SYNTHETIC_EXECUTION_MARKER',
        description: 'for..in traversal found visitor key on Object.prototype',
      };
    }
    default:
      return {
        triggered: false,
        impactReproduced: false,
        impact: 'NONE',
        description: `No gadget for labTarget: ${labTarget}`,
      };
  }
}

async function handleScenarioRun(req) {
  const { sourceId, property, payload, labTarget } = req.body;
  const startTime = Date.now();
  const events = [];

  // --- Phase 1: capture baseline ---
  const beforeCapture = capturePrototypeState('before');
  events.push(genEvent('INPUT_RECEIVED', 0, `Received payload for ${sourceId}, property: ${property}`, {
    sourceId,
    property,
    value: typeof payload === 'object' ? JSON.stringify(payload).slice(0, 200) : String(payload),
  }));

  // --- Phase 2: execute pollution source ---
  let sourceError = null;
  try {
    executeSource(sourceId, payload, property);
    events.push(genEvent('MERGE_EXECUTED', Date.now() - startTime, `Source ${sourceId} executed with payload`, { sourceId }));
  } catch (err) {
    sourceError = err.message;
    events.push(genEvent('ERROR', Date.now() - startTime, `Source execution failed: ${err.message}`, { sourceId }));
  }

  // --- Phase 3: detect pollution ---
  const addedProps = diffPrototypeStates(beforeCapture, null);
  const prototypePolluted = addedProps.length > 0;

  const beforeState = buildObjectState(beforeCapture, [], 'before');
  const afterState = buildObjectState({ id: genId(), timestamp: Date.now(), label: 'after' }, addedProps, 'after');

  if (prototypePolluted) {
    events.push(genEvent('PROTOTYPE_POLLUTED', Date.now() - startTime,
      `Object.prototype polluted with: ${addedProps.join(', ')}`,
      { property: addedProps[0], value: Object.prototype[addedProps[0]] }
    ));

    // Verify inheritance on a fresh object
    const testObj = {};
    for (const prop of addedProps) {
      if (testObj[prop] !== undefined) {
        events.push(genEvent('PROPERTY_INHERITED', Date.now() - startTime,
          `Fresh {} inherits ${prop} from Object.prototype`,
          { property: prop, value: testObj[prop] }
        ));
      }
    }
  }

  // --- Phase 4: trigger gadget ---
  let gadgetTriggered = false;
  let gadgetResult = null;
  let impactReproduced = false;

  if (prototypePolluted && !sourceError) {
    gadgetResult = await triggerGadget(labTarget, property);
    gadgetTriggered = gadgetResult.triggered;
    impactReproduced = gadgetResult.impactReproduced;

    if (gadgetTriggered) {
      events.push(genEvent('GADGET_TRIGGERED', Date.now() - startTime,
        gadgetResult.description,
        { gadgetId: labTarget, value: gadgetResult.impact }
      ));
    }
    if (impactReproduced) {
      events.push(genEvent('IMPACT_EXECUTED', Date.now() - startTime,
        `Impact reproduced: ${gadgetResult.impact}`,
        { property }
      ));
    }
  }

  // --- Phase 5: restore Object.prototype ---
  restorePrototype(addedProps);

  const duration = Date.now() - startTime;

  return {
    runId: genId(),
    events,
    objectStates: { before: beforeState, after: afterState },
    propagation: {
      property: addedProps[0] || property,
      affectedObjects: prototypePolluted ? ['{}', 'config', 'user', 'Array.prototype', 'Function.prototype'] : [],
      count: addedProps.length,
    },
    gadgetTriggered,
    gadgetResult,
    impactReproduced,
    synthetic: true,
    labTarget,
    duration,
    prototypePolluted,
    addedProperties: addedProps,
    sourceError,
  };
}

router.post('/run', async (req, res) => {
  if (!req.body || !req.body.sourceId || !req.body.labTarget) {
    return res.status(400).json({ error: 'sourceId and labTarget are required' });
  }

  try {
    const result = await enqueue(() => handleScenarioRun(req));
    res.json(result);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      res.status(500).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Scenario execution failed' });
    }
  }
});

module.exports = router;
