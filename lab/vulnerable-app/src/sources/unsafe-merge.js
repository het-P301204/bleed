'use strict';

// VULNERABLE: flat merge using for..in without own-property check.
// Directly assigns source[key] to target[key] for every enumerable key,
// including inherited ones and "__proto__". When source has "__proto__"
// as an own property (JSON.parse), target["__proto__"] = value directly
// sets Object.prototype properties or reassigns the prototype chain.
function mergeConfig(target, source) {
  for (const key in source) {
    // VULNERABLE: no hasOwnProperty check, assigns directly
    target[key] = source[key];
  }
  return target;
}

// Recursive variant for nested configs — same vulnerability
function mergeConfigDeep(target, source) {
  for (const key in source) {
    // VULNERABLE
    if (typeof source[key] === 'object' && source[key] !== null && typeof target[key] === 'object') {
      mergeConfigDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = { mergeConfig, mergeConfigDeep };
