'use strict';
const axios = require('axios');

// HARDENED: config is created with Object.create(null) so it has NO prototype.
// Inherited properties from Object.prototype cannot reach it, so a polluted
// baseURL on Object.prototype is never visible to this config object.
async function safeRequest(targetURL, extraHeaders) {
  const config = Object.create(null);
  config.timeout = 5000;
  config.headers = Object.assign(Object.create(null), {
    'X-Bleed-Lab': 'hardened-app',
  }, extraHeaders || {});

  // config.baseURL is undefined — cannot be inherited (null prototype)
  const baseURLCheck = config.baseURL;

  try {
    const resp = await axios.get(targetURL, config);
    return {
      status: resp.status,
      data: resp.data,
      baseURL: baseURLCheck || null,
      baseURLInherited: false,
      protectionApplied: 'Object.create(null) prevents prototype inheritance',
    };
  } catch (err) {
    return {
      status: err?.response?.status ?? 0,
      error: err?.message,
      baseURL: null,
      baseURLInherited: false,
    };
  }
}

async function makeRequest(path) {
  const httpSimURL = process.env.HTTP_SIM_URL || 'http://http-sim:4020';
  return safeRequest(`${httpSimURL}${path}`);
}

async function makeRequestWithSafeHeaders(path) {
  const metaURL = process.env.METADATA_SIM_URL || 'http://metadata-sim:4022';
  // Only use explicitly defined headers — Object.create(null) base ensures no inheritance
  return safeRequest(`${metaURL}${path}`);
}

module.exports = { makeRequest, makeRequestWithSafeHeaders };
