import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Play, Search } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import { mockSources, mockGadgets, mockChains } from '../api/mockData'
import { useChainBuilderStore } from '../store/runs'
import BleedPathAnimation from '../components/chain/BleedPathAnimation'
import type { Chain } from '@bleed/shared'

const LAB_TARGETS = [
  { value: 'http-sim', label: 'http-sim', desc: 'HTTP request capture simulator (port 4010)' },
  { value: 'exec-sim', label: 'exec-sim', desc: 'Execution marker simulator (port 4011)' },
  { value: 'auth-sim', label: 'auth-sim', desc: 'Auth bypass simulator (port 4012)' },
]

const STEPS = ['Select Source', 'Select Gadget', 'Configure Target', 'Build & Run']

export default function ChainBuilderPage() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [built, setBuilt] = useState<Chain | null>(null)
  const [building, setBuilding] = useState(false)
  const store = useChainBuilderStore()

  const selectedSource = mockSources.find(s => s.id === store.selectedSourceId)
  const candidateGadgets = store.selectedSourceId
    ? mockGadgets.filter(g => !['INCONCLUSIVE', 'BLOCKED'].includes(g.status))
    : mockGadgets

  const build = async () => {
    setBuilding(true)
    await new Promise(r => setTimeout(r, 1200))
    const chain = { ...mockChains[0]!, id: `CHN-${Date.now()}`, createdAt: Date.now() }
    setBuilt(chain)
    store.setBuiltChain(chain)
    setBuilding(false)
    setStep(3)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <button onClick={() => nav('/chains')} className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors">
        <ArrowLeft size={16} /> Back to Chains
      </button>

      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Builder</div>
        <h1 className="text-2xl font-bold">Build a Chain</h1>
        <p className="text-ivory/50 text-sm mt-1">Connect a pollution source to a gadget and configure the lab target.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
                i === step ? 'border-coral text-coral bg-coral/5' :
                i < step ? 'border-sage/40 text-sage' :
                'border-border text-ivory/30'
              }`}
            >
              {i < step ? <Check size={10} /> : <span className="w-3 text-center">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <ArrowRight size={12} className="text-ivory/20 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 0: Select Source */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ivory">Select a Pollution Source</h2>
          <div className="space-y-3">
            {mockSources.map(src => (
              <button
                key={src.id}
                onClick={() => { store.setSource(src.id); setStep(1) }}
                className={`w-full text-left bg-surface border rounded-md p-4 transition-colors hover:border-ivory/20 ${
                  store.selectedSourceId === src.id ? 'border-coral/50 bg-coral/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-ivory/30">{src.id}</span>
                  <StatusBadge status={src.status} />
                  <Badge label={src.category} variant="plum" />
                </div>
                <div className="font-medium text-ivory text-sm">{src.name}</div>
                <div className="text-xs font-mono text-coral mt-1">.{src.property}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Gadget */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-ivory">Select a Gadget</h2>
            {selectedSource && (
              <span className="text-xs font-mono text-coral/70 border border-coral/20 px-2 py-0.5 rounded">
                Property: .{selectedSource.property}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {candidateGadgets.map(g => (
              <button
                key={g.id}
                onClick={() => { store.setGadget(g.id); setStep(2) }}
                className={`w-full text-left bg-surface border rounded-md p-4 transition-colors hover:border-ivory/20 ${
                  store.selectedGadgetId === g.id ? 'border-coral/50 bg-coral/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-ivory/30">{g.id}</span>
                  <StatusBadge status={g.status} />
                  <Badge label={g.category} variant="iris" />
                </div>
                <div className="font-medium text-ivory text-sm">{g.library}</div>
                <div className="flex gap-3 mt-1 text-xs font-mono text-ivory/40">
                  <span className="text-coral">.{g.property}</span>
                  <span>→</span>
                  <span>{g.impactClass.replace('SYNTHETIC_', '')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Configure Target */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ivory">Configure Lab Target</h2>
          <p className="text-xs text-ivory/40">Select the lab service to target. All targets are synthetic simulators in the isolated Docker network.</p>
          <div className="space-y-3">
            {LAB_TARGETS.map(t => (
              <button
                key={t.value}
                onClick={() => store.setTarget(t.value)}
                className={`w-full text-left bg-surface border rounded-md p-4 transition-colors ${
                  store.selectedTarget === t.value ? 'border-coral/50 bg-coral/5' : 'border-border hover:border-ivory/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {store.selectedTarget === t.value && <Check size={12} className="text-coral" />}
                  <span className="font-mono font-medium text-ivory">{t.label}</span>
                </div>
                <div className="text-xs text-ivory/40 mt-1 ml-5 font-mono">{t.desc}</div>
              </button>
            ))}
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={build}
              disabled={building}
              className="flex items-center gap-2 bg-coral text-graphite font-bold px-6 py-2.5 rounded-sm hover:bg-coral/90 transition-colors disabled:opacity-50"
            >
              {building ? (
                <><span className="font-mono text-xs animate-pulse">Analyzing...</span></>
              ) : (
                <><Search size={14} /> Analyze Reachability</>
              )}
            </button>
            <button
              onClick={() => setStep(1)}
              className="border border-border text-ivory/50 px-4 py-2.5 rounded-sm hover:border-ivory/30 hover:text-ivory transition-colors text-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && built && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sage">
            <Check size={16} />
            <span className="font-medium">Chain built successfully</span>
          </div>
          <div className="bg-surface border border-border rounded-md p-4">
            <div className="text-xs font-mono text-ivory/30 mb-2">{built.id}</div>
            <div className="font-semibold text-ivory">{built.name}</div>
            <div className="flex gap-3 mt-2 text-xs font-mono text-ivory/40">
              <span className="text-coral">.{built.property}</span>
              <span>→</span>
              <StatusBadge status={built.status} />
            </div>
          </div>

          <BleedPathAnimation chain={built} autoPlay />

          <div className="flex gap-3">
            <button
              onClick={() => nav(`/chains/${built.id}`)}
              className="flex items-center gap-2 bg-coral text-graphite font-bold px-5 py-2.5 rounded-sm hover:bg-coral/90 transition-colors text-sm"
            >
              <Play size={14} /> Run Controlled Demonstration
            </button>
            <button
              onClick={() => { store.reset(); setStep(0); setBuilt(null) }}
              className="border border-border text-ivory/50 px-4 py-2.5 rounded-sm hover:border-ivory/30 hover:text-ivory transition-colors text-sm"
            >
              Build Another
            </button>
          </div>

          <div className="text-xs font-mono text-ivory/20 border border-border rounded px-3 py-2">
            CONTROLLED LAB IMPACT — synthetic data only. No real systems targeted.
          </div>
        </div>
      )}
    </div>
  )
}
