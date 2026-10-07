import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, ChevronDown, ArrowRight, X, Check, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../components/common/Badge'
import { mockScenarios, mockSources, mockChains } from '../api/mockData'
import type { Scenario } from '@bleed/shared'

// ─── Flow step types ──────────────────────────────────────────────────────────

interface FlowStep {
  label: string
  detail: string
  icon: string
}

const FLOW_STEPS: FlowStep[] = [
  { label: 'INPUT',     detail: 'Attacker-controlled JSON body received',           icon: '→' },
  { label: 'MERGE',     detail: 'deepMerge() processes nested keys including __proto__', icon: '⊕' },
  { label: 'PROTOTYPE', detail: 'Object.prototype property is now set',              icon: '⬡' },
  { label: 'GADGET',    detail: 'Library reads property without own-property check', icon: '⚡' },
  { label: 'IMPACT',    detail: 'Controlled lab impact executed',                    icon: '◉' },
]

// ─── Scenario selector ────────────────────────────────────────────────────────

interface ScenarioSelectProps {
  selected: Scenario
  onSelect: (s: Scenario) => void
}

function ScenarioSelect({ selected, onSelect }: ScenarioSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-md hover:border-ivory/30 transition-colors"
      >
        <span className="font-mono text-xs text-ivory/40">{selected.id}</span>
        <span className="text-sm text-ivory font-medium">{selected.name}</span>
        <ChevronDown size={14} className="text-ivory/40 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 min-w-[340px] bg-surface border border-border rounded-md shadow-xl overflow-hidden">
            {mockScenarios.map(s => (
              <button
                key={s.id}
                onClick={() => { onSelect(s); setOpen(false) }}
                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-border last:border-0 ${selected.id === s.id ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-ivory/30">{s.id}</span>
                  <StatusBadge status={s.difficulty} />
                </div>
                <div className="text-sm text-ivory">{s.name}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Flow column ──────────────────────────────────────────────────────────────

interface FlowColumnProps {
  mode: 'vulnerable' | 'hardened'
  property: string
  delay?: number
}

function FlowColumn({ mode, property, delay = 0 }: FlowColumnProps) {
  const isVulnerable = mode === 'vulnerable'
  const headerColor = isVulnerable ? 'text-coral border-coral/30 bg-coral/5' : 'text-sage border-sage/30 bg-sage/5'
  const headerLabel = isVulnerable ? 'VULNERABLE FIXTURE' : 'HARDENED FIXTURE'

  return (
    <motion.div
      initial={{ opacity: 0, x: isVulnerable ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex-1"
    >
      {/* Column header */}
      <div className={`text-center text-xs font-mono font-bold uppercase tracking-widest py-2.5 px-4 rounded-t-md border ${headerColor} mb-0`}>
        {headerLabel}
      </div>

      {/* Steps */}
      <div className="border border-t-0 border-border rounded-b-md overflow-hidden">
        {FLOW_STEPS.map((step, i) => {
          const isBlocked = !isVulnerable && i === 1 // MERGE step gets blocked in hardened
          const isGreyed = !isVulnerable && i > 1   // Steps after MERGE greyed out in hardened

          return (
            <div key={step.label}>
              <div
                className={`flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 transition-colors ${
                  isGreyed ? 'opacity-30' : 'opacity-100'
                } ${isBlocked ? 'bg-coral/5' : 'bg-surface/40'}`}
              >
                {/* Step icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-mono font-bold ${
                    isGreyed
                      ? 'bg-ivory/5 text-ivory/20 border border-ivory/10'
                      : isVulnerable
                      ? 'bg-coral/10 text-coral border border-coral/30'
                      : i < 1
                      ? 'bg-sage/10 text-sage border border-sage/30'
                      : isBlocked
                      ? 'bg-coral/10 text-coral border border-coral/30'
                      : 'bg-ivory/5 text-ivory/20 border border-ivory/10'
                  }`}
                >
                  {step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-xs font-bold ${isGreyed ? 'text-ivory/20' : 'text-ivory/60'}`}>
                      {step.label}
                    </span>

                    {/* Blocked banner */}
                    {isBlocked && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-coral bg-coral/10 border border-coral/30 px-2 py-0.5 rounded">
                        <X size={10} />
                        BLOCKED
                      </span>
                    )}

                    {/* Flow arrow (vulnerable only, not last step) */}
                    {isVulnerable && i < FLOW_STEPS.length - 1 && (
                      <ArrowRight size={12} className="text-coral/50" />
                    )}

                    {/* Impact marker (vulnerable, last step) */}
                    {isVulnerable && i === FLOW_STEPS.length - 1 && (
                      <span className="text-xs font-mono text-coral border border-coral/30 px-1.5 py-0.5 rounded bg-coral/5">
                        IMPACT
                      </span>
                    )}
                  </div>

                  <div className={`text-xs mt-0.5 leading-relaxed ${isGreyed ? 'text-ivory/20' : 'text-ivory/50'}`}>
                    {isBlocked
                      ? `Key guard rejected __proto__ — no prototype pollution`
                      : step.detail.replace('property', `.${property}`)}
                  </div>

                  {/* Property label on PROTOTYPE step */}
                  {step.label === 'PROTOTYPE' && !isGreyed && (
                    <div className={`mt-1 font-mono text-xs ${isVulnerable ? 'text-coral' : 'text-sage'}`}>
                      {isVulnerable ? `Object.prototype.${property} = attacker_value` : `Object.prototype unchanged ✓`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BeforeAfter() {
  const navigate = useNavigate()
  const [scenario, setScenario] = useState<Scenario>(mockScenarios[0]!)

  const source = mockSources.find(s => s.id === scenario.sourceId)
  const relatedChain = mockChains.find(c => c.scenarioId === scenario.id)

  const examplePayload = {
    username: 'alice',
    options: {
      __proto__: {
        [scenario.property]: 'ATTACKER_CONTROLLED_VALUE',
      },
    },
  }

  const summaryRows = [
    { label: 'Prototype polluted',  vuln: true,  hard: false },
    { label: 'Gadget reachable',    vuln: scenario.expected.gadgetReachable, hard: false },
    { label: 'Impact reproduced',   vuln: scenario.expected.impactReproduced, hard: false },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Analysis</div>
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={20} className="text-coral" />
          <h1 className="text-2xl font-bold">Before / After Hardening</h1>
        </div>
        <p className="text-ivory/50 text-sm mt-1">
          Compare vulnerable and hardened fixture behavior side-by-side for each research scenario.
        </p>
      </div>

      {/* Scenario selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-ivory/50 font-mono">Scenario:</span>
        <ScenarioSelect selected={scenario} onSelect={setScenario} />
        {scenario && <StatusBadge status={scenario.difficulty} />}
      </div>

      {/* Scenario description + payload */}
      <motion.div
        key={scenario.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <div className="bg-surface border border-border rounded-md p-5">
          <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-2">Scenario Description</div>
          <p className="text-sm text-ivory/80 leading-relaxed">{scenario.description}</p>
          <div className="flex gap-6 mt-4 text-xs font-mono">
            <div><span className="text-ivory/30">Property: </span><span className="text-coral">.{scenario.property}</span></div>
            <div><span className="text-ivory/30">Gadget: </span><span className="text-iris">{scenario.gadgetId}</span></div>
            <div><span className="text-ivory/30">Impact: </span><span className="text-marigold">{scenario.impact}</span></div>
            <div><span className="text-ivory/30">Lab: </span><span className="text-ivory/60">{scenario.labTarget}</span></div>
          </div>
        </div>

        {/* Payload preview */}
        <div className="bg-graphite/60 border border-border rounded-md">
          <div className="px-4 py-2 border-b border-border text-xs font-mono text-ivory/30 uppercase tracking-wider">
            Input Payload — Attacker-Controlled JSON
          </div>
          <pre className="px-4 py-3 text-xs font-mono text-marigold/80 overflow-x-auto whitespace-pre">
            {JSON.stringify(examplePayload, null, 2)}
          </pre>
        </div>

        {/* Two-column flow comparison */}
        <div className="flex gap-4">
          <FlowColumn mode="vulnerable" property={scenario.property} delay={0} />
          <FlowColumn mode="hardened" property={scenario.property} delay={0.1} />
        </div>

        {/* Summary table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="border border-border rounded-lg overflow-hidden"
        >
          <div className="grid grid-cols-3 bg-surface/80 border-b border-border text-xs font-mono text-ivory/40 uppercase tracking-wider">
            <div className="px-4 py-3">Check</div>
            <div className="px-4 py-3 border-l border-border text-coral">Vulnerable</div>
            <div className="px-4 py-3 border-l border-border text-sage">Hardened</div>
          </div>
          {summaryRows.map(row => (
            <div key={row.label} className="grid grid-cols-3 border-b border-border last:border-0">
              <div className="px-4 py-3 text-sm text-ivory/60">{row.label}</div>
              <div className="px-4 py-3 border-l border-border">
                {row.vuln
                  ? <span className="inline-flex items-center gap-1 font-mono text-xs text-coral"><Check size={12} />Yes</span>
                  : <span className="inline-flex items-center gap-1 font-mono text-xs text-ivory/30"><X size={12} />No</span>}
              </div>
              <div className="px-4 py-3 border-l border-border">
                {row.hard
                  ? <span className="inline-flex items-center gap-1 font-mono text-xs text-coral"><Check size={12} />Yes</span>
                  : <span className="inline-flex items-center gap-1 font-mono text-xs text-sage"><X size={12} />No</span>}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Source code comparison (if available) */}
        {source && (
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-coral/20 rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-coral/5 border-b border-coral/20 text-xs font-mono text-coral uppercase tracking-wider">
                Vulnerable — {source.functionName}()
              </div>
              <pre className="px-4 py-3 text-xs font-mono text-ivory/60 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {source.vulnerableCode}
              </pre>
            </div>
            {source.hardenedCode && (
              <div className="border border-sage/20 rounded-md overflow-hidden">
                <div className="px-4 py-2 bg-sage/5 border-b border-sage/20 text-xs font-mono text-sage uppercase tracking-wider">
                  Hardened — {source.functionName}()
                </div>
                <pre className="px-4 py-3 text-xs font-mono text-ivory/60 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                  {source.hardenedCode}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Run both CTA */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/lab', { state: { scenarioId: scenario.id } })}
            className="flex items-center gap-2 bg-coral text-graphite font-mono font-bold text-sm px-5 py-2.5 rounded-md hover:bg-coral/90 transition-colors"
          >
            <Play size={14} />
            Run Both in Lab
          </button>
        </div>
      </motion.div>
    </div>
  )
}
