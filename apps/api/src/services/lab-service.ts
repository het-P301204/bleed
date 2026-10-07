import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { LabState, LabService } from '@bleed/shared'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const COMPOSE_DIR = resolve(__dirname, '../../../../')

const LAB_SERVICES: LabService[] = [
  { id: 'vulnerable-app', name: 'Vulnerable App', description: 'Node.js app with prototype pollution sinks', port: 4010, status: 'UNKNOWN', healthUrl: 'http://localhost:4010/health' },
  { id: 'hardened-app', name: 'Hardened App', description: 'Patched version of vulnerable-app', port: 4011, status: 'UNKNOWN', healthUrl: 'http://localhost:4011/health' },
  { id: 'http-sim', name: 'HTTP Sim', description: 'Simulated HTTP target for SSRF/method override scenarios', port: 4020, status: 'UNKNOWN', healthUrl: 'http://localhost:4020/health' },
  { id: 'auth-sim', name: 'Auth Sim', description: 'Simulated auth endpoint for privilege escalation scenarios', port: 4021, status: 'UNKNOWN', healthUrl: 'http://localhost:4021/health' },
  { id: 'metadata-sim', name: 'Metadata Sim', description: 'Simulated metadata service for credential injection scenarios', port: 4022, status: 'UNKNOWN', healthUrl: 'http://localhost:4022/health' },
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
