import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play, Cpu, Shield, FileSearch, FlaskConical, RefreshCw, ShieldCheck, ArrowRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityLogEntry {
  id: string
  timestamp: number
  type:
    | 'RUN_COMPLETED'
    | 'GADGET_CONFIRMED'
    | 'CHAIN_BLOCKED'
    | 'EVIDENCE_CAPTURED'
    | 'SCENARIO_EXECUTED'
    | 'FIXTURE_UPDATED'
    | 'HARDENED_BLOCKED'
  title: string
  description: string
  entityId: string
  entityType: 'run' | 'gadget' | 'chain' | 'evidence' | 'scenario' | 'source'
}

// ─── Inline fallback data ─────────────────────────────────────────────────────

const now = Date.now()

const fallbackActivityLog: ActivityLogEntry[] = [
  {
    id: 'ACT-001',
    timestamp: now - 4 * 60 * 1000,
    type: 'RUN_COMPLETED',
    title: 'Run RUN-001 completed',
    description: 'deepMerge → axios baseURL chain reproduced SSRF impact',
    entityId: 'RUN-001',
    entityType: 'run',
  },
  {
    id: 'ACT-002',
    timestamp: now - 12 * 60 * 1000,
    type: 'GADGET_CONFIRMED',
    title: 'Gadget GAD-003 confirmed',
    description: 'express-session admin flag read from polluted prototype',
    entityId: 'GAD-003',
    entityType: 'gadget',
  },
  {
    id: 'ACT-003',
    timestamp: now - 22 * 60 * 1000,
    type: 'CHAIN_BLOCKED',
    title: 'Chain CHN-001 blocked by hardening',
    description: 'Hardened deepMerge prevented __proto__ propagation',
    entityId: 'CHN-001',
    entityType: 'chain',
  },
  {
    id: 'ACT-004',
    timestamp: now - 35 * 60 * 1000,
    type: 'EVIDENCE_CAPTURED',
    title: 'Evidence EVD-003 captured',
    description: 'HTTP request issued to attacker-controlled baseURL',
    entityId: 'EVD-003',
    entityType: 'evidence',
  },
  {
    id: 'ACT-005',
    timestamp: now - 48 * 60 * 1000,
    type: 'SCENARIO_EXECUTED',
    title: 'Scenario SCN-002 executed',
    description: 'Query Parser → EJS RCE-sim scenario run in exec-sim',
    entityId: 'SCN-002',
    entityType: 'scenario',
  },
  {
    id: 'ACT-006',
    timestamp: now - 65 * 60 * 1000,
    type: 'FIXTURE_UPDATED',
    title: 'Fixture FIX-001 updated',
    description: 'deepMerge fixture updated to version 1.0.1 with new hardenedCode',
    entityId: 'FIX-001',
    entityType: 'source',
  },
  {
    id: 'ACT-007',
    timestamp: now - 82 * 60 * 1000,
    type: 'HARDENED_BLOCKED',
    title: 'Hardened mode blocked CHN-003',
    description: 'Session admin bypass prevented by hasOwnProperty guard',
    entityId: 'CHN-003',
    entityType: 'chain',
  },
  {
    id: 'ACT-008',
    timestamp: now - 104 * 60 * 1000,
    type: 'GADGET_CONFIRMED',
    title: 'Gadget GAD-001 confirmed SSRF',
    description: 'axios mergeConfig reads baseURL from Object.prototype',
    entityId: 'GAD-001',
    entityType: 'gadget',
  },
  {
    id: 'ACT-009',
    timestamp: now - 131 * 60 * 1000,
    type: 'EVIDENCE_CAPTURED',
    title: 'Evidence EVD-004 captured',
    description: 'Session check read admin flag from Object.prototype',
    entityId: 'EVD-004',
    entityType: 'evidence',
  },
  {
    id: 'ACT-010',
    timestamp: now - 160 * 60 * 1000,
    type: 'RUN_COMPLETED',
    title: 'Run RUN-003 completed',
    description: 'deepMerge → express-session admin bypass reproduced',
    entityId: 'RUN-003',
    entityType: 'run',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts
  const secs = Math.floor(diffMs / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type EntryType = ActivityLogEntry['type']

const iconMap: Record<EntryType, { icon: React.ElementType; color: string }> = {
  RUN_COMPLETED: { icon: Play, color: 'text-coral' },
  GADGET_CONFIRMED: { icon: Cpu, color: 'text-marigold' },
  CHAIN_BLOCKED: { icon: Shield, color: 'text-sage' },
  EVIDENCE_CAPTURED: { icon: FileSearch, color: 'text-iris' },
  SCENARIO_EXECUTED: { icon: FlaskConical, color: 'text-ivory/40' },
  FIXTURE_UPDATED: { icon: RefreshCw, color: 'text-ivory/40' },
  HARDENED_BLOCKED: { icon: ShieldCheck, color: 'text-sage' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityFeed() {
  const nav = useNavigate()

  // Use inline fallback data (mockActivityLog not yet in mockData.ts — added by a separate agent)
  const entries: ActivityLogEntry[] = fallbackActivityLog

  return (
    <div>
      <div
        className="max-h-80 overflow-y-auto space-y-0 divide-y divide-border rounded-md border border-border bg-surface"
        style={{ scrollbarWidth: 'thin' }}
      >
        {entries.map((entry, i) => {
          const { icon: Icon, color } = iconMap[entry.type]
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <Icon size={14} className={`mt-0.5 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ivory/80 truncate">{entry.title}</span>
                  <span className="text-xs font-mono text-ivory/25 flex-shrink-0">{relativeTime(entry.timestamp)}</span>
                </div>
                <p className="text-xs text-ivory/40 mt-0.5 truncate">{entry.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
      <button
        onClick={() => nav('/runs')}
        className="mt-2 flex items-center gap-1 text-xs text-ivory/35 hover:text-ivory transition-colors font-mono"
      >
        View all activity <ArrowRight size={11} />
      </button>
    </div>
  )
}
