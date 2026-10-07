'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'vulnerable-app',
    mode: 'vulnerable',
    port: parseInt(process.env.PORT || '4010', 10),
    warning: 'INTENTIONALLY VULNERABLE — for controlled research only',
  });
});

module.exports = router;
