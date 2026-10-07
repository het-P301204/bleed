import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Shield, ChevronRight, Loader2, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react'
import type { Scenario, ResearchRun, RuntimeEvent } from '@bleed/shared'
import { scenariosApi } from '../../api/index'
import { useNavigate } from 'react-router-dom'
import { useRunsStore } from '../../store/runs'

interface Props {
  scenario: Scenario
}

type RunState = 'idle' | 'running' | 'done' | 'error'

const EVENT_ICONS: Record<string, JSX.Element> = {
  INPUT_RECEIVED: <ChevronRight size={12} className="text-ivory/40" />,
  MERGE_EXECUTED: <ChevronRight size={12} className="text-marigold" />,
  PROTOTYPE_POLLUTED: <AlertTriangle size={12} className="text-coral" />,
  PROPERTY_INHERITED: <AlertTriangle size={12} className="text-coral" />,
  GADGET_TRIGGERED: <AlertTriangle size={12} className="text-coral" />,
  IMPACT_EXECUTED: <XCircle size={12} className="text-coral" />,
  HARDENED_BLOCKED: <CheckCircle2 size={12} className="text-sage" />,
  ERROR: <XCircle size={12} className="text-coral" />,
}

function EventRow({ event, index }: { event: RuntimeEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0"
    >
      <div className="mt-0.5 flex-shrink-0">
        {EVENT_ICONS[event.type] ?? <ChevronRight size={12} className="text-ivory/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-ivory/60">{event.type}</div>
        <div className="text-xs text-ivory/80 mt-0.5">{event.description}</div>
      </div>
      <div className="text-xs font-mono text-ivory/30 flex-shrink-0">+{event.relativeMs}ms</div>
    </motion.div>
  )
}

export default function ScenarioExecutor({ scenario }: Props) {
  const [state, setState] = useState<RunState>('idle')
  const [run, setRun] = useState<ResearchRun | null>(null)
  const [hardenedRun, setHardenedRun] = useState<ResearchRun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const addRun = useRunsStore(s => s.addRun)

  async function execute(mode: 'vulnerable' | 'hardened') {
    setState('running')
    setError(null)
    if (mode === 'vulnerable') { setRun(null); setHardenedRun(null) }
    try {
      const result = await scenariosApi.run(scenario.id, mode)
      addRun(result)
      if (mode === 'vulnerable') setRun(result)
      else setHardenedRun(result)
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed')
      setState('error')
    }
  }

  const statusColor = (r: ResearchRun) => {
    if (r.result === 'REPRODUCED') return 'text-coral bg-coral/10 border-coral/30'
    if (r.result === 'BLOCKED') return 'text-sage bg-sage/10 border-sage/30'
    if (r.result === 'REACHABLE') return 'text-marigold bg-marigold/10 border-marigold/30'
    return 'text-ivory/50 bg-surface border-border'
  }

  return (
    <div className="space-y-4">
      {/* Payload preview */}
      <div className="bg-surface border border-border rounded-md p-4">
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Pollution Payload</div>
        <pre className="text-xs font-mono text-marigold overflow-x-auto">
          {JSON.stringify({ __proto__: { [scenario.property]: `http://${scenario.labTarget}` } }, null, 2)}
        </pre>
        <div className="mt-2 text-xs text-ivory/40">
          Lab target: <span className="text-iris font-mono">{scenario.labTarget}</span>
          {' · '}Impact: <span className="text-coral font-mono">{scenario.impact}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => execute('vulnerable')}
          disabled={state === 'running'}
          className="flex items-center gap-2 bg-coral text-graphite text-sm font-semibold px-4 py-2.5 rounded-sm hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state === 'running' && !hardenedRun
            ? <Loader2 size={14} className="animate-spin" />
            : <Play size={14} />}
          Run Vulnerable
        </button>
        <button
          onClick={() => execute('hardened')}
          disabled={state === 'running'}
          className="flex items-center gap-2 bg-sage/20 text-sage border border-sage/30 text-sm font-semibold px-4 py-2.5 rounded-sm hover:bg-sage/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state === 'running' && hardenedRun !== null
            ? <Loader2 size={14} className="animate-spin" />
            : <Shield size={14} />}
          Run Hardened
        </button>
      </div>

      {/* Safety notice */}
      <div className="flex items-center gap-2 text-xs text-ivory/30 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        CONTROLLED LAB IMPACT — synthetic data only — no real external requests
      </div>

      {/* Results */}
      <AnimatePresence>
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-coral/10 border border-coral/30 rounded-md p-4 text-sm text-coral"
          >
            <div className="font-semibold mb-1">Execution Error</div>
            <div className="font-mono text-xs">{error}</div>
            <div className="text-xs text-ivory/40 mt-2">Lab services may not be running. Results will use simulation mode.</div>
          </motion.div>
        )}

        {(run || hardenedRun) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Side by side or single */}
            <div className={`grid ${run && hardenedRun ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {run && (
                <div className="bg-surface border border-border rounded-md overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-coral/5">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${statusColor(run)}`}>{run.result}</span>
                    <span className="text-xs text-ivory/50">VULNERABLE</span>
                    <span className="ml-auto text-xs font-mono text-ivory/30 flex items-center gap-1"><Clock size={10} />{run.duration}ms</span>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Run ID</div>
                    <div className="text-xs font-mono text-iris mb-4">{run.id}</div>
                    <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Event Timeline</div>
                    <div className="space-y-0">
                      {run.events.map((ev, i) => <EventRow key={ev.id} event={ev} index={i} />)}
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => nav(`/runs/${run.id}`)}
                      className="text-xs text-iris hover:text-iris/70 font-mono transition-colors"
                    >
                      View Full Run →
                    </button>
                  </div>
                </div>
              )}

              {hardenedRun && (
                <div className="bg-surface border border-sage/20 rounded-md overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-sage/20 bg-sage/5">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${statusColor(hardenedRun)}`}>{hardenedRun.result}</span>
                    <span className="text-xs text-ivory/50">HARDENED</span>
                    <span className="ml-auto text-xs font-mono text-ivory/30 flex items-center gap-1"><Clock size={10} />{hardenedRun.duration}ms</span>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Run ID</div>
                    <div className="text-xs font-mono text-iris mb-4">{hardenedRun.id}</div>
                    <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Event Timeline</div>
                    <div className="space-y-0">
                      {hardenedRun.events.map((ev, i) => <EventRow key={ev.id} event={ev} index={i} />)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison insight if both run */}
            {run && hardenedRun && (
              <div className="bg-surface border border-border rounded-md p-4 text-sm">
                <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Hardening Result</div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-ivory/70">
                      {run.result === 'REPRODUCED' && hardenedRun.result === 'BLOCKED'
                        ? 'The hardened variant successfully blocked prototype pollution at the source. The gadget was unreachable and no controlled impact occurred.'
                        : `Vulnerable: ${run.result}. Hardened: ${hardenedRun.result}.`}
                    </div>
                  </div>
                  {run.result === 'REPRODUCED' && hardenedRun.result === 'BLOCKED' && (
                    <CheckCircle2 size={20} className="text-sage flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
