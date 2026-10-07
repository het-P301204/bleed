'use strict';

// VULNERABLE: uses Object.assign which processes own enumerable properties.
// Object.assign reads properties via [[Get]] which traverses prototype chain on source.
// When source has own "__proto__" data property (from JSON.parse), Object.assign
// calls target["__proto__"] = val which invokes the __proto__ setter and can change
// target's prototype. Combined with nested assign it pollutes Object.prototype.
function buildConfig(target, ...sources) {
  // VULNERABLE: Object.assign with user-supplied sources
  return Object.assign(target, ...sources);
}

// Nested config builder that recursively applies Object.assign — more exploitable
function buildNestedConfig(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      // VULNERABLE: assign into target[key] which may be Object.prototype subtree
      buildNestedConfig(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

module.exports = { buildConfig, buildNestedConfig };
