'use strict';
const express = require('express');
const app = express();

app.use(express.json());

const PORT = parseInt(process.env.PORT || '4021', 10);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-sim', port: PORT });
});

app.post('/authorize', (req, res) => {
  const body = req.body || {};
  const user = body.user || {};
  const resource = body.resource || 'unknown';

  const role = user.role;
  const isAdmin = user.isAdmin;
  const authorized = role === 'admin' || isAdmin === true;

  const note = authorized
    ? 'Authorization GRANTED — verify whether role/isAdmin came from prototype inheritance'
    : 'Authorization DENIED — user has no admin role or isAdmin flag';

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    resource,
    receivedRole: role,
    receivedIsAdmin: isAdmin,
    authorized,
  }));

  res.json({
    synthetic: true,
    service: 'auth-sim',
    warning: 'CONTROLLED LAB IMPACT — synthetic authorization only',
    authorized,
    receivedRole: role !== undefined ? String(role) : undefined,
    receivedIsAdmin: isAdmin !== undefined ? Boolean(isAdmin) : undefined,
    resource,
    note,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[auth-sim] listening on port ${PORT}`);
});
