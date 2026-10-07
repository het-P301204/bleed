import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { LabState, LabService } from '@bleed/shared'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const COMPOSE_DIR = resolve(__dirname, '../../../../')

// Use service URLs from env (Docker service names in production, localhost in dev)
const VULN_URL = process.env['VULNERABLE_APP_URL'] ?? 'http://localhost:4010'
const HARD_URL = process.env['HARDENED_APP_URL'] ?? 'http://localhost:4011'
const HTTP_SIM_URL = process.env['HTTP_SIM_URL'] ?? 'http://localhost:4020'
const AUTH_SIM_URL = process.env['AUTH_SIM_URL'] ?? 'http://localhost:4021'
const META_SIM_URL = process.env['METADATA_SIM_URL'] ?? 'http://localhost:4022'

const LAB_SERVICES: LabService[] = [
  { id: 'vulnerable-app', name: 'Vulnerable App', description: 'Node.js app with prototype pollution sinks', port: 4010, status: 'UNKNOWN', healthUrl: `${VULN_URL}/health` },
  { id: 'hardened-app', name: 'Hardened App', description: 'Patched version of vulnerable-app', port: 4011, status: 'UNKNOWN', healthUrl: `${HARD_URL}/health` },
  { id: 'http-sim', name: 'HTTP Sim', description: 'Simulated HTTP target for SSRF/method override scenarios', port: 4020, status: 'UNKNOWN', healthUrl: `${HTTP_SIM_URL}/health` },
  { id: 'auth-sim', name: 'Auth Sim', description: 'Simulated auth endpoint for privilege escalation scenarios', port: 4021, status: 'UNKNOWN', healthUrl: `${AUTH_SIM_URL}/health` },
  { id: 'metadata-sim', name: 'Metadata Sim', description: 'Simulated metadata service for credential injection scenarios', port: 4022, status: 'UNKNOWN', healthUrl: `${META_SIM_URL}/health` },
]

async function checkServiceHealth(service: LabService): Promise<LabService> {
  if (!service.healthUrl) return { ...service, status: 'UNKNOWN' }
  try {
    const res = await fetch(service.healthUrl, { signal: AbortSignal.timeout(2000) })
    return { ...service, status: res.ok ? 'READY' : 'ERROR' }
  } catch {
    return { ...service, status: 'STOPPED' }
  }
}

export async function getLabState(): Promise<LabState> {
  const checked = await Promise.all(LAB_SERVICES.map(checkServiceHealth))
  const allReady = checked.every(s => s.status === 'READY')
  const anyError = checked.some(s => s.status === 'ERROR')
  const status = allReady ? 'READY' : anyError ? 'ERROR' : 'STOPPED'
  return { status, services: checked }
}

export async function startLab(): Promise<LabState> {
  try {
    await execAsync('docker compose up -d', { cwd: COMPOSE_DIR })
  } catch {
    // Docker may not be available in dev
  }
  return getLabState()
}

export async function stopLab(): Promise<LabState> {
  try {
    await execAsync('docker compose down', { cwd: COMPOSE_DIR })
  } catch {
    // Docker may not be available in dev
  }
  return getLabState()
}
