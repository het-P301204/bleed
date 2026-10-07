'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'hardened-app',
    mode: 'hardened',
    port: parseInt(process.env.PORT || '4011', 10),
    protection: 'Object.keys + key blocklist + null-prototype configs',
  });
});

module.exports = router;
