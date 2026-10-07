'use strict';

// VULNERABLE: normalizes a query parameter object using for..in.
// Intended to copy query params to a clean object, but uses for..in without
// hasOwnProperty check, allowing inherited properties from a polluted prototype
// to be written onto the result and thence onto Object.prototype through the
// recursive path.
function normalizeQuery(target, query) {
  for (const key in query) {
    // VULNERABLE: no own-property guard
    const val = query[key];
    if (typeof val === 'object' && val !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      normalizeQuery(target[key], val);
    } else {
      // coerce to string for query params — but still writes to prototype if key is __proto__
      target[key] = String(val);
    }
  }
  return target;
}

module.exports = { normalizeQuery };
