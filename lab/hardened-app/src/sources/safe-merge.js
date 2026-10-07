'use strict';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// HARDENED: Object.keys returns only own enumerable properties, excluding
// inherited ones and the special "__proto__" accessor key.
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED_KEYS.has(key)) continue;
    target[key] = source[key];
  }
  return target;
}

module.exports = { safeMerge };
