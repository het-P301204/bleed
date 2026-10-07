'use strict';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// HARDENED: Object.keys only, with blocklist. Inherited properties are never copied.
function safeNormalizeQuery(target, query) {
  for (const key of Object.keys(query)) {
    if (BLOCKED_KEYS.has(key)) continue;
    const val = query[key];
    if (typeof val === 'object' && val !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      safeNormalizeQuery(target[key], val);
    } else {
      target[key] = String(val);
    }
  }
  return target;
}

module.exports = { safeNormalizeQuery };
