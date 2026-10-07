'use strict';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// HARDENED: sanitizes sources before passing to Object.assign.
// Removes dangerous keys so they are never written to any target.
function safeBuildConfig(target, ...sources) {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    const sanitized = {};
    for (const key of Object.keys(source)) {
      if (BLOCKED_KEYS.has(key)) continue;
      sanitized[key] = source[key];
    }
    Object.assign(target, sanitized);
  }
  return target;
}

module.exports = { safeBuildConfig };
