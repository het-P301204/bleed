#!/usr/bin/env node
// validate-lab.js — Verifies all 5 BLEED lab services are functional.
// Run from inside Docker (docker exec bleed-api node /app/scripts/validate-lab.js)
// or locally after adding port mappings to docker-compose for the lab services.
//
// URL defaults assume the services are accessible at their internal names;
// override with environment variables for local host access:
//   VULNERABLE_APP_URL=http://localhost:4010
//   HARDENED_APP_URL=http://localhost:4011
//   HTTP_SIM_URL=http://localhost:4020
//   AUTH_SIM_URL=http://localhost:4021
//   METADATA_SIM_URL=http://localhost:4022

'use strict';

const URLS = {
  vulnerableApp: process.env.VULNERABLE_APP_URL || 'http://vulnerable-app:4010',
  hardenedApp:   process.env.HARDENED_APP_URL   || 'http://hardened-app:4011',
  httpSim:       process.env.HTTP_SIM_URL        || 'http://http-sim:4020',
  authSim:       process.env.AUTH_SIM_URL        || 'http://auth-sim:4021',
  metadataSim:   process.env.METADATA_SIM_URL    || 'http://metadata-sim:4022',
};

// NOTE: payload must be a raw JSON string because { '__proto__': ... } in a JS
// object literal invokes the prototype setter and JSON.stringify would drop the key.
function makeScenarioJSON(labTarget, mode) {
  const baseURL = URLS.httpSim;
  return `{"sourceId":"src-recursive-merge","property":"baseURL","payload":{"__proto__":{"baseURL":"${baseURL}"}},"labTarget":"${labTarget}","mode":"${mode}"}`;
}

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ✓ PASS  ${label}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL  ${label}${detail ? `\n         ${detail}` : ''}`);
    failed++;
  }
}

async function get(url) {
  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const body = await resp.json();
  return { status: resp.status, body };
}

async function post(url, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const respBody = await resp.json();
  return { status: resp.status, body: respBody };
}

async function main() {
  console.log('\n=== BLEED Lab Validation ===\n');

  // ── 1. Health checks ──────────────────────────────────────────────────────
  console.log('[ Health Checks ]');
  const services = [
    ['vulnerable-app', `${URLS.vulnerableApp}/health`],
    ['hardened-app',   `${URLS.hardenedApp}/health`],
    ['http-sim',       `${URLS.httpSim}/health`],
    ['auth-sim',       `${URLS.authSim}/health`],
    ['metadata-sim',   `${URLS.metadataSim}/health`],
  ];

  for (const [name, url] of services) {
    try {
      const { status, body } = await get(url);
      check(`${name} /health → 200`, status === 200, `got ${status}`);
      check(`${name} status=ok`, body.status === 'ok', `got ${JSON.stringify(body.status)}`);
    } catch (err) {
      check(`${name} /health reachable`, false, err.message);
      check(`${name} status=ok`, false, 'unreachable');
    }
  }

  // ── 2. Vulnerable app scenario: should pollute & impact ───────────────────
  console.log('\n[ Vulnerable App: src-recursive-merge + baseURL ]');
  let vulnResult;
  try {
    const { status, body } = await post(`${URLS.vulnerableApp}/api/scenario/run`, makeScenarioJSON('http-sim', 'vulnerable'));
    vulnResult = body;
    check('POST /api/scenario/run → 200', status === 200, `got ${status}`);
    check('synthetic: true', body.synthetic === true, JSON.stringify(body.synthetic));
    check('prototypePolluted: true', body.prototypePolluted === true,
      `got ${JSON.stringify(body.prototypePolluted)}`);
    check('impactReproduced: true', body.impactReproduced === true,
      `got ${JSON.stringify(body.impactReproduced)}`);
    check('gadgetTriggered: true', body.gadgetTriggered === true,
      `got ${JSON.stringify(body.gadgetTriggered)}`);
    check('events array non-empty', Array.isArray(body.events) && body.events.length > 0,
      `got ${body.events?.length} events`);
    check('PROTOTYPE_POLLUTED event present',
      Array.isArray(body.events) && body.events.some(e => e.type === 'PROTOTYPE_POLLUTED'),
      'no PROTOTYPE_POLLUTED event');
  } catch (err) {
    check('vulnerable-app scenario request', false, err.message);
    vulnResult = null;
  }

  // ── 3. Hardened app scenario: same payload should be blocked ──────────────
  console.log('\n[ Hardened App: same payload should be BLOCKED ]');
  try {
    const { status, body } = await post(`${URLS.hardenedApp}/api/scenario/run`, makeScenarioJSON('http-sim', 'hardened'));
    check('POST /api/scenario/run → 200', status === 200, `got ${status}`);
    check('synthetic: true', body.synthetic === true, JSON.stringify(body.synthetic));
    check('prototypePolluted: false (blocked)', body.prototypePolluted === false,
      `got ${JSON.stringify(body.prototypePolluted)}`);
    check('impactReproduced: false (blocked)', body.impactReproduced === false,
      `got ${JSON.stringify(body.impactReproduced)}`);
    check('gadgetTriggered: false (blocked)', body.gadgetTriggered === false,
      `got ${JSON.stringify(body.gadgetTriggered)}`);
    check('blocked: true', body.blocked === true, `got ${JSON.stringify(body.blocked)}`);
  } catch (err) {
    check('hardened-app scenario request', false, err.message);
  }

  // ── 4. Sim service smoke tests ────────────────────────────────────────────
  console.log('\n[ Sim Services: synthetic response format ]');
  try {
    const { body } = await get(`${URLS.httpSim}/some-path`);
    check('http-sim synthetic:true', body.synthetic === true, JSON.stringify(body.synthetic));
    check('http-sim has warning', typeof body.warning === 'string' && body.warning.includes('CONTROLLED'),
      JSON.stringify(body.warning));
  } catch (err) {
    check('http-sim synthetic response', false, err.message);
  }

  try {
    const { body } = await post(`${URLS.authSim}/authorize`, { user: { role: 'admin' }, resource: 'test' });
    check('auth-sim synthetic:true', body.synthetic === true, JSON.stringify(body.synthetic));
    check('auth-sim authorized=true for role=admin', body.authorized === true, JSON.stringify(body.authorized));
  } catch (err) {
    check('auth-sim authorize', false, err.message);
  }

  try {
    const { body } = await get(`${URLS.metadataSim}/credentials`);
    check('metadata-sim synthetic:true', body.synthetic === true, JSON.stringify(body.synthetic));
    check('metadata-sim has synthetic credentials',
      body.credentials && body.credentials.LAB_ACCESS_KEY === 'AKIAIOSFODNN7EXAMPLE-LAB',
      JSON.stringify(body.credentials?.LAB_ACCESS_KEY));
    check('metadata-sim warning present', typeof body.warning === 'string' && body.warning.includes('CONTROLLED'),
      JSON.stringify(body.warning));
  } catch (err) {
    check('metadata-sim credentials', false, err.message);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);
  console.log(`  Result: ${failed === 0 ? '✓ ALL CHECKS PASSED' : `✗ ${failed} CHECK(S) FAILED`}`);
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Validation script error:', err);
  process.exit(1);
});
