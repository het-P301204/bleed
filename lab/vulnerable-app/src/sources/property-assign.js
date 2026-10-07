'use strict';

// VULNERABLE: applies options with for..in — iterates both own and inherited properties.
// No hasOwnProperty guard and no key blocklist. An options object whose prototype
// was polluted will propagate those inherited properties to target.
function applyOptions(target, options) {
  for (const key in options) {
    // VULNERABLE: for..in iterates inherited properties too
    // VULNERABLE: no key blocklist (__proto__, constructor, prototype)
    if (typeof options[key] === 'object' && options[key] !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      applyOptions(target[key], options[key]);
    } else {
      target[key] = options[key];
    }
  }
  return target;
}

module.exports = { applyOptions };
