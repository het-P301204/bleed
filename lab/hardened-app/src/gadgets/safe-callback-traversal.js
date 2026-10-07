'use strict';

// HARDENED: uses Object.keys to iterate only own enumerable properties.
// A "visitor" property on Object.prototype is never seen here.
function safeTraverseObject(obj) {
  const keysFound = Object.keys(obj); // own only

  for (const key of keysFound) {
    if (key === 'visitor' && typeof obj[key] === 'function') {
      try {
        obj[key]();
      } catch (_) {}
    }
  }

  return {
    traversed: true,
    keysFound,
    executionMarkerReached: false,
    marker: null,
    blocked: true,
    protectionApplied: 'Object.keys prevents prototype property traversal',
  };
}

module.exports = { safeTraverseObject };
