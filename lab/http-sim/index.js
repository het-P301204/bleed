'use strict';
const express = require('express');
const app = express();

app.use(express.json());

const PORT = parseInt(process.env.PORT || '4020', 10);

const SAFE_LOG_HEADERS = new Set([
  'host', 'content-type', 'accept', 'user-agent',
  'authorization', 'x-lab-secret', 'x-bleed-inherited',
  'x-forwarded-for', 'content-length',
]);

function filterHeaders(headers) {
  const result = {};
  for (const key of Object.keys(headers)) {
    if (SAFE_LOG_HEADERS.has(key.toLowerCase()) || key.toLowerCase().startsWith('x-')) {
      result[key] = headers[key];
    }
  }
  return result;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'http-sim', port: PORT });
});

app.all('*', (req, res) => {
  const received = {
    method: req.method,
    path: req.path,
    headers: filterHeaders(req.headers),
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    received.body = req.body;
  }

  if (req.headers['x-bleed-inherited']) {
    received.baseURLInherited = true;
    received.inheritedBaseURL = req.headers['x-bleed-inherited'];
  }

  const response = {
    synthetic: true,
    service: 'http-sim',
    warning: 'CONTROLLED LAB IMPACT — synthetic endpoint only',
    received,
    timestamp: Date.now(),
  };

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    method: req.method,
    path: req.path,
    baseURLInherited: !!received.baseURLInherited,
  }));

  res.json(response);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[http-sim] listening on port ${PORT}`);
});
