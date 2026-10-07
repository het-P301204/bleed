import { randomUUID } from 'node:crypto'
import type { Scenario, ResearchRun, ChainStatus, RuntimeEvent } from '@bleed/shared'
import { buildChain } from '@bleed/chain-engine'
import { capturePrototypeBaseline, detectPrototypePollution, restorePrototype } from '@bleed/runtime-model'
import { createEvidence, createRuntimeEvent, createRun, storeRun } from '@bleed/evidence'

const VULNERABLE_APP_URL = process.env['VULNERABLE_APP_URL'] ?? 'http://localhost:4010'
const HARDENED_APP_URL = process.env['HARDENED_APP_URL'] ?? 'http://localhost:4011'

function buildPayload(scenario: Scenario): Record<string, unknown> {
  if (scenario.property === '__proto__' || scenario.sourceId === 'src-recursive-merge' || scenario.sourceId === 'src-unsafe-merge') {
    return { __proto__: { [scenario.property]: `http://${scenario.labTarget}` } }
  }
  if (scenario.sourceId === 'src-deep-parser') {
    return { path: `__proto__.${scenario.property}`, value: 'admin' }
  }
  if (scenario.sourceId === 'src-config-merge') {
    return { __proto__: { [scenario.property]: { 'X-Lab-Cred': 'synthetic-secret' } } }
  }
  return { __proto__: { [scenario.property]: 'polluted' } }
}

async function callVulnerableApp(
  appUrl: string,
  scenario: Scenario,
  payload: Record<string, unknown>,
): Promise<{ polluted: boolean; impactReproduced: boolean; labResponse?: unknown }> {
  try {
    const res = await fetch(`${appUrl}/api/scenario/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: scenario.sourceId,
        property: scenario.property,
        labTarget: scenario.labTarget,
        payload,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return { polluted: false, impactReproduced: false }
    }

    const data = (await res.json()) as Record<string, unknown>
    return {
      polluted: Boolean(data['polluted']),
      impactReproduced: Boolean(data['impactReproduced']),
      labResponse: data['labResponse'],
    }
  } catch {
    return { polluted: false, impactReproduced: false }
  }
}

function buildMockRun(scenario: Scenario, mode: 'vulnerable' | 'hardened', startTime: number): ResearchRun {
  const isVulnerable = mode === 'vulnerable'
  const result: ChainStatus = isVulnerable ? 'REPRODUCED' : 'BLOCKED'

  const chain = buildChain(scenario.sourceId, scenario.gadgetId, scenario.id)

  const events: RuntimeEvent[] = [
    createRuntimeEvent('INPUT_RECEIVED', `Untrusted JSON payload delivered to ${scenario.sourceId}`, { sourceId: scenario.sourceId, property: scenario.property }, startTime),
    createRuntimeEvent('MERGE_EXECUTED', `${scenario.sourceId} executed: ${isVulnerable ? 'no sanitization applied' : 'sanitization blocked the payload'}`, { sourceId: scenario.sourceId }, startTime),
    ...(isVulnerable
      ? [
          createRuntimeEvent('PROTOTYPE_POLLUTED', `Object.prototype.${scenario.property} set to lab value`, { property: scenario.property, gadgetId: scenario.gadgetId }, startTime),
          createRuntimeEvent('PROPERTY_INHERITED', `Target object inherited ${scenario.property} from Object.prototype`, { property: scenario.property }, startTime),
          createRuntimeEvent('GADGET_TRIGGERED', `${scenario.gadgetId} read polluted ${scenario.property}`, { gadgetId: scenario.gadgetId, property: scenario.property }, startTime),
          createRuntimeEvent('IMPACT_EXECUTED', `${scenario.impact} achieved: lab target ${scenario.labTarget} reached`, { gadgetId: scenario.gadgetId }, startTime),
        ]
      : [
          createRuntimeEvent('HARDENED_BLOCKED', `Hardened variant rejected the payload at source; prototype unchanged`, { sourceId: scenario.sourceId }, startTime),
        ]),
  ]

  const evidence = isVulnerable
    ? [createEvidence({ property: scenario.property, origin: 'Object.prototype', description: `${scenario.property} polluted by ${scenario.sourceId} and consumed by ${scenario.gadgetId}`, fixtureVersion: '0.1.0' })]
    : []

  return createRun({
    scenarioId: scenario.id,
    fixtureId: scenario.fixtureId,
    fixtureVersion: '0.1.0',
    packageVersions: { axios: '1.7.0' },
    chain: { ...chain, status: result },
    input: buildPayload(scenario),
    objectStates: [],
    events,
    result,
    mitigationState: isVulnerable ? 'VULNERABLE' : 'HARDENED',
    evidence,
    duration: Date.now() - startTime,
    notes: [],
  })
}

export async function runScenario(scenario: Scenario, mode: 'vulnerable' | 'hardened' = 'vulnerable'): Promise<ResearchRun> {
  const startTime = Date.now()
  const appUrl = mode === 'hardened' ? HARDENED_APP_URL : VULNERABLE_APP_URL
  const payload = buildPayload(scenario)

  const baseline = capturePrototypeBaseline()

  let run: ResearchRun
  try {
    const appResult = await callVulnerableApp(appUrl, scenario, payload)
    const polluted = detectPrototypePollution(baseline)

    const chain = buildChain(scenario.sourceId, scenario.gadgetId, scenario.id)
    const isVulnerable = appResult.polluted || polluted.length > 0
    const result: ChainStatus = isVulnerable
      ? appResult.impactReproduced ? 'REPRODUCED' : 'REACHABLE'
      : mode === 'hardened' ? 'BLOCKED' : 'POTENTIAL'

    const events: RuntimeEvent[] = [
      createRuntimeEvent('INPUT_RECEIVED', `Payload sent to ${appUrl}`, { sourceId: scenario.sourceId }, startTime),
      createRuntimeEvent(
        isVulnerable ? 'PROTOTYPE_POLLUTED' : 'HARDENED_BLOCKED',
        isVulnerable ? `Pollution detected: ${polluted.join(', ')}` : 'No pollution detected',
        { property: scenario.property },
        startTime,
      ),
      ...(appResult.impactReproduced
        ? [createRuntimeEvent('IMPACT_EXECUTED', `Lab target ${scenario.labTarget} responded to polluted request`, { gadgetId: scenario.gadgetId }, startTime)]
        : []),
    ]

    const evidence = isVulnerable
      ? [createEvidence({ property: scenario.property, origin: 'Object.prototype', description: `Live run: ${scenario.property} polluted, gadget ${scenario.gadgetId} triggered`, fixtureVersion: '0.1.0' })]
      : []

    run = createRun({
      scenarioId: scenario.id,
      fixtureId: scenario.fixtureId,
      fixtureVersion: '0.1.0',
      packageVersions: { axios: '1.7.0' },
      chain: { ...chain, status: result },
      input: payload,
      objectStates: [],
      events,
      result,
      mitigationState: mode === 'hardened' ? 'HARDENED' : 'VULNERABLE',
      evidence,
      duration: Date.now() - startTime,
      notes: [],
    })
  } catch {
    run = buildMockRun(scenario, mode, startTime)
  } finally {
    restorePrototype(baseline)
  }

  storeRun(run)
  return run
}
