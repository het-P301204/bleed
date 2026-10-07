'use strict';
const express = require('express');
const app = express();

app.use(express.json({ limit: '1mb' }));

app.use((req, _res, next) => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    method: req.method,
    path: req.path,
    service: 'vulnerable-app',
  }));
  next();
});

app.use('/health', require('./routes/health'));
app.use('/api/scenario', require('./routes/scenario'));

app.use((_req, res) => {
  res.status(404).json({ error: 'not found', service: 'vulnerable-app' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message, service: 'vulnerable-app' });
});

const PORT = parseInt(process.env.PORT || '4010', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[vulnerable-app] listening on port ${PORT} (INTENTIONALLY VULNERABLE)`);
});
