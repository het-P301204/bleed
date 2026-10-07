'use strict';

const EXECUTION_MARKER = 'BLEED_DEMO_EXECUTION_MARKER';

// VULNERABLE: for..in iterates inherited properties from Object.prototype.
// If "visitor" was polluted onto Object.prototype, traverseObject({}) will
// find it through prototype chain traversal and trigger the callback or
// record the execution marker.
function traverseObject(obj) {
  const results = [];
  const keysFound = [];

  for (const key in obj) {
    // VULNERABLE: no hasOwnProperty check — inherited keys are processed
    keysFound.push(key);
    const val = obj[key];

    if (key === 'visitor') {
      const isOwn = Object.prototype.hasOwnProperty.call(obj, key);

      if (typeof val === 'function') {
        try {
          val();
          results.push('visitor-function-invoked');
        } catch (_) {
          results.push('visitor-function-invoked-threw');
        }
      } else if (
        val === EXECUTION_MARKER ||
        (typeof val === 'string' && val.includes('BLEED'))
      ) {
        results.push(`execution-marker-reached:${EXECUTION_MARKER}`);
      }

      results.push(`visitor-key-origin:${isOwn ? 'own' : 'inherited'}`);
    }
  }

  const executionMarkerReached = results.some((r) => r.includes('execution-marker'));

  return {
    traversed: true,
    keysFound,
    results,
    executionMarkerReached,
    marker: executionMarkerReached ? EXECUTION_MARKER : null,
  };
}

module.exports = { traverseObject, EXECUTION_MARKER };
