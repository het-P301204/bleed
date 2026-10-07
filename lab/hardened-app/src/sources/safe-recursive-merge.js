'use strict';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// HARDENED: uses Object.keys (own enumerable only) and an explicit blocklist.
// "__proto__" never appears as a key here, so Object.prototype is never touched.
function safeDeepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED_KEYS.has(key)) continue;
    const val = source[key];
    if (typeof val === 'object' && val !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      safeDeepMerge(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

module.exports = { safeDeepMerge };
