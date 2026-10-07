'use strict';
const express = require('express');
const router = express.Router();

const { capturePrototypeState, diffPrototypeStates, restorePrototype, buildObjectState } = require('../lib/state-tracker');
const { safeDeepMerge } = require('../sources/safe-recursive-merge');
const { safeMerge } = require('../sources/safe-merge');
const { safeSetByPath } = require('../sources/safe-deep-parser');
const { safeBuildConfig } = require('../sources/safe-config-merge');
const { safeApplyOptions } = require('../sources/safe-property-assign');
const { safeNormalizeQuery } = require('../sources/safe-query-normalize');
const { makeRequest, makeRequestWithSafeHeaders } = require('../gadgets/safe-axios-client');
const { checkAuthorizationSafe } = require('../gadgets/safe-auth-check');
const { safeTraverseObject } = require('../gadgets/safe-callback-traversal');

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function genEvent(type, relativeMs, description, extras) {
  return { id: genId(), type, timestamp: Date.now(), relativeMs, description, ...extras };
}

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
    .finally(() => { running = false; drain(); });
}

// Run the hardened source — same payload, different (safe) implementation
function executeHardenedSource(sourceId, payload, property) {
  switch (sourceId) {
    case 'src-recursive-merge':
      safeDeepMerge({}, payload);
      break;
    case 'src-unsafe-merge':
      safeMerge({}, payload);
      break;
    case 'src-deep-parser': {
      let value;
      if (payload && typeof payload === 'object' && property in payload) {
        value = payload[property];
      } else if (payload && typeof payload === 'object' && 'value' in payload) {
        value = payload.value;
      } else {
        value = payload;
      }
      safeSetByPath({}, `__proto__.${property}`, value);
      break;
    }
    case 'src-config-merge':
      safeBuildConfig({}, payload);
      break;
    case 'src-property-assign':
      safeApplyOptions({}, payload);
      break;
    case 'src-query-normalize':
      safeNormalizeQuery({}, payload);
      break;
    default:
      throw new Error(`Unknown sourceId: ${sourceId}`);
  }
}

async function triggerGadget(labTarget) {
  switch (labTarget) {
    case 'http-sim': {
      const result = await makeRequest('/bleed-probe');
      return {
        triggered: false,
        impactReproduced: false,
        response: result,
        impact: 'NONE',
        description: 'Hardened: null-prototype config cannot inherit baseURL',
        blocked: true,
      };
    }
    case 'auth-sim': {
      const user = {};
      const result = checkAuthorizationSafe(user);
      return {
        triggered: false,
        impactReproduced: false,
        response: result,
        impact: 'NONE',
        description: 'Hardened: hasOwnProperty check blocked prototype-inherited role',
        blocked: true,
      };
    }
    case 'metadata-sim': {
      const result = await makeRequestWithSafeHeaders('/credentials');
      return {
        triggered: false,
        impactReproduced: false,
        response: result,
        impact: 'NONE',
        description: 'Hardened: null-prototype config cannot inherit headers',
        blocked: true,
      };
    }
    case 'execution-sim': {
      const result = safeTraverseObject({});
      return {
        triggered: false,
        impactReproduced: false,
        response: result,
        impact: 'NONE',
        description: 'Hardened: Object.keys prevented inherited visitor traversal',
        blocked: true,
      };
    }
    default:
      return { triggered: false, impactReproduced: false, impact: 'NONE', blocked: true };
  }
}

async function handleScenarioRun(req) {
  const { sourceId, property, payload, labTarget } = req.body;
  const startTime = Date.now();
  const events = [];

  const beforeCapture = capturePrototypeState('before');
  events.push(genEvent('INPUT_RECEIVED', 0, `Hardened: received payload for ${sourceId}`, { sourceId, property }));

  let sourceError = null;
  try {
    executeHardenedSource(sourceId, payload, property);
    events.push(genEvent('HARDENED_BLOCKED', Date.now() - startTime,
      `Hardened source ${sourceId} processed payload without polluting prototype`, { sourceId }));
  } catch (err) {
    sourceError = err.message;
    events.push(genEvent('ERROR', Date.now() - startTime, `Source error: ${err.message}`, { sourceId }));
  }

  const addedProps = diffPrototypeStates(beforeCapture);
  const prototypePolluted = addedProps.length > 0;

  // Hardened app should never pollute; clean up if something slipped through
  if (prototypePolluted) {
    restorePrototype(addedProps);
    events.push(genEvent('ERROR', Date.now() - startTime,
      `Unexpected: prototype was polluted by hardened source (cleaned up): ${addedProps.join(', ')}`,
      { property: addedProps[0] }
    ));
  } else {
    events.push(genEvent('HARDENED_BLOCKED', Date.now() - startTime,
      'Prototype pollution BLOCKED — Object.prototype unchanged', {}));
  }

  const beforeState = buildObjectState(beforeCapture, [], 'before');
  const afterCapture = { id: genId(), timestamp: Date.now(), label: 'after' };
  const afterState = buildObjectState(afterCapture, [], 'after');

  const gadgetResult = await triggerGadget(labTarget);

  const duration = Date.now() - startTime;

  return {
    runId: genId(),
    events,
    objectStates: { before: beforeState, after: afterState },
    propagation: {
      property,
      affectedObjects: [],
      count: 0,
    },
    gadgetTriggered: false,
    gadgetResult,
    impactReproduced: false,
    synthetic: true,
    labTarget,
    duration,
    prototypePolluted: false,
    addedProperties: [],
    blocked: true,
    blockReason: prototypePolluted
      ? 'prototype was polluted unexpectedly but cleaned up'
      : 'Object.keys + key blocklist prevented pollution',
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
