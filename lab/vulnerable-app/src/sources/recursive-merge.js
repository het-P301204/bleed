'use strict';

// VULNERABLE: recursive merge with for..in and no own-property check.
// When source is JSON-parsed with {"__proto__": {...}}, for..in iterates "__proto__"
// as an own enumerable property. target["__proto__"] resolves to Object.prototype
// (via the inherited getter), so deepMerge recurses into Object.prototype and
// writes properties onto it — classic prototype pollution.
function deepMerge(target, source) {
  for (const key in source) {
    // VULNERABLE: no hasOwnProperty guard
    // VULNERABLE: no blocklist for __proto__ / constructor / prototype
    const val = source[key];
    if (typeof val === 'object' && val !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      deepMerge(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

module.exports = { deepMerge };
