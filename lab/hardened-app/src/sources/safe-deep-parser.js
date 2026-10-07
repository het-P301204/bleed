'use strict';

const BLOCKED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

// HARDENED: validates each path segment before navigating to it.
// A path like "__proto__.baseURL" is rejected before any traversal.
function safeSetByPath(obj, path, value) {
  const parts = path.split('.');
  for (const part of parts) {
    if (BLOCKED_SEGMENTS.has(part)) {
      return { blocked: true, reason: `Blocked path segment: "${part}"`, path };
    }
  }

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (
      typeof current[parts[i]] !== 'object' ||
      current[parts[i]] === null
    ) {
      current[parts[i]] = Object.create(null);
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return { blocked: false, obj };
}

module.exports = { safeSetByPath };
