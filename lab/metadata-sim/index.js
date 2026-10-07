'use strict';
const express = require('express');
const app = express();

app.use(express.json());

const PORT = parseInt(process.env.PORT || '4022', 10);

const SYNTHETIC_CREDENTIALS = {
  LAB_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE-LAB',
  LAB_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY-LAB',
  LAB_SESSION_TOKEN: 'AQoDYXdzEJr-LAB-TOKEN-SYNTHETIC',
  note: 'These are synthetic lab values — not real credentials',
};

function extractInterestingHeaders(headers) {
  const result = {};
  for (const key of Object.keys(headers)) {
    const lkey = key.toLowerCase();
    if (lkey === 'authorization' || lkey.startsWith('x-')) {
      result[key] = headers[key];
    }
  }
  return result;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'metadata-sim', port: PORT });
});

app.get('/credentials', (req, res) => {
  const receivedHeaders = extractInterestingHeaders(req.headers);

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    path: '/credentials',
    receivedHeaders,
  }));

  res.json({
    synthetic: true,
    service: 'metadata-sim',
    warning: 'CONTROLLED LAB IMPACT — synthetic credentials only. Not real AWS or cloud credentials.',
    credentials: SYNTHETIC_CREDENTIALS,
    receivedHeaders,
    timestamp: Date.now(),
  });
});

app.get('/', (req, res) => {
  const receivedHeaders = extractInterestingHeaders(req.headers);

  res.json({
    synthetic: true,
    service: 'metadata-sim',
    warning: 'CONTROLLED LAB IMPACT — synthetic metadata endpoint only',
    availablePaths: ['/credentials', '/health'],
    receivedHeaders,
    timestamp: Date.now(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[metadata-sim] listening on port ${PORT}`);
});
