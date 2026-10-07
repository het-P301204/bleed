'use strict';
const axios = require('axios');

// Internal lab Docker service hostnames — no external traffic allowed
const ALLOWED_LAB_HOSTS = new Set(['http-sim', 'auth-sim', 'metadata-sim']);

function isAllowedLabTarget(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return ALLOWED_LAB_HOSTS.has(parsed.hostname);
  } catch (_) {
    return false;
  }
}

// VULNERABLE: config is a plain {} that inherits from Object.prototype.
// If baseURL was polluted onto Object.prototype, config.baseURL resolves to
// the attacker-controlled value through prototype chain traversal.
async function makeRequest(path, options) {
  const config = Object.assign({}, options || {});
  // config.baseURL now reads from Object.prototype if polluted — the vulnerability
  const inheritedBaseURL = config.baseURL;
  const baseURLIsOwn = Object.prototype.hasOwnProperty.call(config, 'baseURL');
  const baseURLInherited = inheritedBaseURL !== undefined && !baseURLIsOwn;

  // Safety: only allow requests to known lab targets (Docker network isolates this
  // anyway, but we enforce it in code too)
  if (inheritedBaseURL && !isAllowedLabTarget(inheritedBaseURL)) {
    return {
      blocked: true,
      reason: 'baseURL is not an internal lab target',
      baseURL: inheritedBaseURL,
      baseURLInherited,
    };
  }

  const fallback = process.env.HTTP_SIM_URL || 'http://http-sim:4020';
  const targetURL = inheritedBaseURL ? `${inheritedBaseURL}${path}` : `${fallback}${path}`;

  try {
    const resp = await axios.get(targetURL, {
      timeout: 5000,
      headers: {
        'X-Bleed-Lab': 'vulnerable-app',
        ...(baseURLInherited ? { 'X-Bleed-Inherited': String(inheritedBaseURL) } : {}),
      },
    });
    return {
      status: resp.status,
      data: resp.data,
      baseURL: inheritedBaseURL || null,
      baseURLInherited,
      targetURL,
    };
  } catch (err) {
    return {
      status: err?.response?.status ?? 0,
      error: err?.message,
      baseURL: inheritedBaseURL || null,
      baseURLInherited,
      targetURL,
    };
  }
}

// Separate request path for metadata-sim that demonstrates header injection
async function makeRequestWithInheritedHeaders(path) {
  const config = {};
  // config.headers may be inherited from Object.prototype if polluted
  const inheritedHeaders = config.headers;
  const headersOwn = Object.prototype.hasOwnProperty.call(config, 'headers');
  const headersInherited = inheritedHeaders !== undefined && !headersOwn;

  const metaURL = process.env.METADATA_SIM_URL || 'http://metadata-sim:4022';
  const targetURL = `${metaURL}${path}`;

  const reqHeaders = {
    'X-Bleed-Lab': 'vulnerable-app',
    ...(headersInherited && typeof inheritedHeaders === 'object' ? inheritedHeaders : {}),
  };

  try {
    const resp = await axios.get(targetURL, { timeout: 5000, headers: reqHeaders });
    return {
      status: resp.status,
      data: resp.data,
      headersInjected: headersInherited,
      injectedHeaders: headersInherited ? inheritedHeaders : null,
      targetURL,
    };
  } catch (err) {
    return {
      status: err?.response?.status ?? 0,
      error: err?.message,
      headersInjected: headersInherited,
      injectedHeaders: headersInherited ? inheritedHeaders : null,
      targetURL,
    };
  }
}

module.exports = { makeRequest, makeRequestWithInheritedHeaders };
