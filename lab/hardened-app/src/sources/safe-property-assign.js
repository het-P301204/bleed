'use strict';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// HARDENED: uses Object.keys (own properties only) with an explicit blocklist.
function safeApplyOptions(target, options) {
  for (const key of Object.keys(options)) {
    if (BLOCKED_KEYS.has(key)) continue;
    if (typeof options[key] === 'object' && options[key] !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      safeApplyOptions(target[key], options[key]);
    } else {
      target[key] = options[key];
    }
  }
  return target;
}

module.exports = { safeApplyOptions };
