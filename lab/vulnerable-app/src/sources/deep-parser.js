'use strict';

// VULNERABLE: sets a nested value by dot-notation path with no key sanitization.
// A path like "__proto__.baseURL" navigates to Object.prototype and writes there.
function setByPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    // VULNERABLE: no check for __proto__, constructor, prototype keys
    if (current[parts[i]] === undefined || current[parts[i]] === null) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  const lastKey = parts[parts.length - 1];
  // VULNERABLE: writes to whatever current is, which may be Object.prototype
  current[lastKey] = value;
  return obj;
}

// Builds a config by parsing a dot-notation string payload
function parseConfigString(obj, configString) {
  const pairs = configString.split('&');
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const path = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    setByPath(obj, path, value);
  }
  return obj;
}

module.exports = { setByPath, parseConfigString };
