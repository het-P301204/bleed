'use strict';

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function capturePrototypeState(label) {
  const names = Object.getOwnPropertyNames(Object.prototype);
  return {
    id: genId(),
    timestamp: Date.now(),
    label,
    propertyNames: new Set(names),
  };
}

function diffPrototypeStates(before) {
  const added = [];
  const afterNames = Object.getOwnPropertyNames(Object.prototype);
  for (const name of afterNames) {
    if (!before.propertyNames.has(name)) {
      added.push(name);
    }
  }
  return added;
}

function restorePrototype(addedProps) {
  for (const prop of addedProps) {
    try {
      delete Object.prototype[prop];
    } catch (_) {}
  }
}

function buildObjectState(capture, addedProps, label) {
  const proto = Object.prototype;
  const polluted = addedProps.length > 0;

  const ownProperties = addedProps.map((key) => {
    let value;
    try {
      const raw = proto[key];
      value = typeof raw === 'function' ? '[Function]' : raw;
    } catch (_) {
      value = null;
    }
    return {
      key,
      value,
      type: typeof proto[key],
      own: true,
      origin: 'prototype-pollution',
      introducedBy: 'merge-operation',
    };
  });

  return {
    id: capture.id,
    timestamp: capture.timestamp,
    label: label || capture.label,
    ownProperties,
    inheritedProperties: [],
    prototypeChain: ['Object.prototype', 'null'],
    polluted,
  };
}

module.exports = { capturePrototypeState, diffPrototypeStates, restorePrototype, buildObjectState };
