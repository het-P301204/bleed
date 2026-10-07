import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Fingerprint, ChevronDown, ChevronRight, Shield, Zap, Link2, FileSearch, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge } from '../components/common/Badge'
import { mockChains, mockGadgets, mockSources, mockEvidence } from '../api/mockData'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropertySummary {
  name: string
  sources: string[]
  chains: string[]
  gadgets: string[]
  evidenceIds: string[]
  impactClasses: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectAllProperties(): PropertySummary[] {
  const map = new Map<string, PropertySummary>()

  const upsert = (name: string) => {
    if (!map.has(name)) {
      map.set(name, { name, sources: [], chains: [], gadgets: [], evidenceIds: [], impactClasses: [] })
    }
    return map.get(name)!
  }

  for (const src of mockSources) {
    const p = upsert(src.property)
    if (!p.sources.includes(src.id)) p.sources.push(src.id)
  }

  for (const chain of mockChains) {
    const p = upsert(chain.property)
    if (!p.chains.includes(chain.id)) p.chains.push(chain.id)
    if (!p.impactClasses.includes(chain.impact)) p.impactClasses.push(chain.impact)
  }

  for (const gad of mockGadgets) {
    const p = upsert(gad.property)
    if (!p.gadgets.includes(gad.id)) p.gadgets.push(gad.id)
  }

  for (const ev of mockEvidence) {
    const p = upsert(ev.property)
    if (!p.evidenceIds.includes(ev.id)) p.evidenceIds.push(ev.id)
  }

  return Array.from(map.values())
}

const impactGroup: Record<string, string> = {
  SYNTHETIC_SSRF: 'SSRF',
  SYNTHETIC_HTTP_MANIPULATION: 'HTTP',
  SYNTHETIC_AUTH_BYPASS: 'AUTH',
  SYNTHETIC_CREDENTIAL_FLOW: 'CREDENTIAL',
  SYNTHETIC_EXECUTION_MARKER: 'EXECUTION',
  NONE: 'NONE',
}

function classifyProperty(summary: PropertySummary): string {
  for (const ic of summary.impactClasses) {
    if (impactGroup[ic]) return impactGroup[ic]
  }
  return 'UNKNOWN'
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ivory/80 hover:text-ivory bg-surface/60 hover:bg-surface transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 bg-graphite/40 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Property List (no selection) ─────────────────────────────────────────────

function PropertyList({ properties, onSelect }: { properties: PropertySummary[]; onSelect: (name: string) => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, PropertySummary[]> = {}
    for (const p of properties) {
      const cls = classifyProperty(p)
      ;(g[cls] ??= []).push(p)
    }
    return g
  }, [properties])

  const groupColors: Record<string, string> = {
    SSRF: 'text-coral border-coral/30',
    HTTP: 'text-marigold border-marigold/30',
    AUTH: 'text-sage border-sage/30',
    EXECUTION: 'text-iris border-iris/30',
    CREDENTIAL: 'text-marigold border-marigold/30',
    UNKNOWN: 'text-ivory/40 border-ivory/20',
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cls, props]) => (
        <div key={cls}>
          <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${groupColors[cls] ?? 'text-ivory/40'}`}>
            {cls} class
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {props.map(p => (
              <button
                key={p.name}
                onClick={() => onSelect(p.name)}
                className="text-left bg-surface border border-border rounded-md p-4 hover:border-coral/40 hover:bg-coral/5 transition-all group"
              >
                <div className="font-mono text-lg text-coral group-hover:text-coral font-medium mb-2">.{p.name}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-ivory/40">
                  <span>{p.sources.length} source{p.sources.length !== 1 ? 's' : ''}</span>
                  <span>{p.chains.length} chain{p.chains.length !== 1 ? 's' : ''}</span>
                  <span>{p.gadgets.length} gadget{p.gadgets.length !== 1 ? 's' : ''}</span>
                  <span>{p.evidenceIds.length} evidence</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Property Detail ──────────────────────────────────────────────────────────

function PropertyDetail({ name }: { name: string }) {
  const sources = mockSources.filter(s => s.property === name)
  const chains = mockChains.filter(c => c.property === name)
  const gadgets = mockGadgets.filter(g => g.property === name)
  const evidence = mockEvidence.filter(e => e.property === name)

  const pollutionSteps = [
    { n: 1, label: 'Untrusted input contains nested property', detail: `Attacker-controlled JSON contains {"__proto__":{"${name}":"..."}}` },
    { n: 2, label: 'Merge function copies without sanitization', detail: 'deepMerge / Object.assign traverses nested keys including __proto__' },
    { n: 3, label: 'Property reaches Object.prototype', detail: `Object.prototype.${name} is now set to attacker value` },
    { n: 4, label: 'All objects inherit it', detail: `Every plain object in the process now returns the attacker value for .${name}` },
    { n: 5, label: 'Downstream consumer reads it without own-property check', detail: 'Library code reads config[property] without hasOwnProperty guard' },
    { n: 6, label: 'Controlled lab impact occurs', detail: 'Impact reproduced in isolated lab environment — synthetic data only' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Property header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="font-mono text-4xl font-bold text-coral mb-4">.{name}</div>
        <div className="flex flex-wrap gap-6 text-sm font-mono">
          <div className="text-center">
            <div className="text-2xl font-bold text-ivory">{sources.length}</div>
            <div className="text-xs text-ivory/40 mt-1">sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ivory">{gadgets.length}</div>
            <div className="text-xs text-ivory/40 mt-1">gadgets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ivory">{chains.length}</div>
            <div className="text-xs text-ivory/40 mt-1">chains</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ivory">{evidence.length}</div>
            <div className="text-xs text-ivory/40 mt-1">evidence records</div>
          </div>
        </div>
      </div>

      {/* Origins */}
      <section>
        <div className="flex items-center gap-2 text-xs font-mono text-ivory/40 uppercase tracking-widest mb-3">
          <AlertCircle size={12} />
          <span>Origins</span>
        </div>
        {sources.length === 0 ? (
          <div className="text-sm text-ivory/30 font-mono">No confirmed sources for this property.</div>
        ) : (
          <div className="space-y-2">
            {sources.map(src => (
              <div key={src.id} className="bg-surface border border-border rounded-md p-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-ivory/30">{src.id}</span>
                  <StatusBadge status={src.status} />
                  <span className="font-mono text-xs text-marigold">{src.category}</span>
                </div>
                <div className="font-medium text-sm text-ivory">{src.name}</div>
                <div className="text-xs text-ivory/50 mt-1">{src.description}</div>
                <div className="font-mono text-xs text-ivory/30 mt-2">{src.file} → {src.functionName}()</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Propagation / Chains */}
      <section>
        <div className="flex items-center gap-2 text-xs font-mono text-ivory/40 uppercase tracking-widest mb-3">
          <Link2 size={12} />
          <span>Propagation — Chains Using This Property</span>
        </div>
        {chains.length === 0 ? (
          <div className="text-sm text-ivory/30 font-mono">No chains recorded for this property.</div>
        ) : (
          <div className="space-y-2">
            {chains.map(chain => (
              <div key={chain.id} className="bg-surface border border-border rounded-md p-4 flex items-center gap-4">
                <span className="font-mono text-xs text-ivory/30 shrink-0">{chain.id}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ivory">{chain.name}</div>
                  <div className="font-mono text-xs text-ivory/30 mt-0.5">{chain.nodes.length} nodes, {chain.edges.length} edges</div>
                </div>
                <StatusBadge status={chain.status} />
                <StatusBadge status={chain.confidence} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gadgets Affected */}
      <section>
        <div className="flex items-center gap-2 text-xs font-mono text-ivory/40 uppercase tracking-widest mb-3">
          <Zap size={12} />
          <span>Gadgets Affected</span>
        </div>
        {gadgets.length === 0 ? (
          <div className="text-sm text-ivory/30 font-mono">No gadgets recorded for this property.</div>
        ) : (
          <div className="space-y-2">
            {gadgets.map(gad => (
              <div key={gad.id} className="bg-surface border border-border rounded-md p-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-ivory/30">{gad.id}</span>
                  <StatusBadge status={gad.status} />
                  <span className="font-mono text-xs text-iris">{gad.category}</span>
                </div>
                <div className="font-medium text-sm text-ivory">{gad.library} <span className="text-ivory/40">{gad.versionRange}</span></div>
                <div className="text-xs text-ivory/50 mt-1">{gad.description}</div>
                <div className="font-mono text-xs text-marigold mt-2">Trigger: {gad.trigger}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mitigations */}
      <section>
        <div className="flex items-center gap-2 text-xs font-mono text-ivory/40 uppercase tracking-widest mb-3">
          <Shield size={12} />
          <span>Mitigations</span>
        </div>
        <div className="space-y-2">
          {gadgets.filter(g => g.mitigation).map(gad => (
            <div key={gad.id} className="bg-surface border border-sage/20 rounded-md p-4">
              <div className="text-xs font-mono text-sage mb-1">{gad.library} — {gad.mitigation.strategy}</div>
              <div className="text-sm text-ivory/70">{gad.mitigation.description}</div>
              {gad.mitigation.codeExample && (
                <div className="mt-2 font-mono text-xs bg-graphite/60 rounded px-3 py-2 text-ivory/60 break-all">
                  {gad.mitigation.codeExample}
                </div>
              )}
              {gad.mitigation.verified && (
                <div className="mt-2 text-xs font-mono text-sage/70">✓ Verified in lab</div>
              )}
            </div>
          ))}
          {gadgets.every(g => !g.mitigation) && (
            <div className="text-sm text-ivory/30 font-mono">No mitigations documented.</div>
          )}
        </div>
      </section>

      {/* Evidence */}
      <section>
        <div className="flex items-center gap-2 text-xs font-mono text-ivory/40 uppercase tracking-widest mb-3">
          <FileSearch size={12} />
          <span>Evidence</span>
        </div>
        {evidence.length === 0 ? (
          <div className="text-sm text-ivory/30 font-mono">No evidence records for this property.</div>
        ) : (
          <div className="space-y-2">
            {evidence.map(ev => (
              <div key={ev.id} className="bg-surface border border-border rounded-md p-4 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-ivory/30">{ev.id}</span>
                  {ev.runtimeEvent && <StatusBadge status={ev.runtimeEvent} />}
                </div>
                <div className="text-sm text-ivory/80">{ev.description}</div>
                {ev.sourceFile && (
                  <div className="font-mono text-xs text-ivory/30">{ev.sourceFile}{ev.sourceLine ? `:${ev.sourceLine}` : ''}</div>
                )}
                {ev.impact && (
                  <div className="inline-block text-xs font-mono text-coral/60 border border-coral/20 px-2 py-0.5 rounded bg-coral/5">
                    {ev.impact}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why does this happen accordion */}
      <Accordion title="Why does this happen? — Step-by-step explanation">
        <div className="space-y-3">
          {pollutionSteps.map(step => (
            <div key={step.n} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-coral/15 border border-coral/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-mono font-bold text-coral">{step.n}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-ivory">{step.label}</div>
                <div className="text-xs text-ivory/50 mt-0.5 font-mono">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Accordion>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyIntelligence() {
  const { name: nameParam } = useParams<{ name?: string }>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const allProperties = useMemo(() => collectAllProperties(), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return allProperties
    const q = search.toLowerCase()
    return allProperties.filter(p => p.name.toLowerCase().includes(q))
  }, [allProperties, search])

  const selectedName = nameParam ?? null

  const handleSelect = (name: string) => {
    navigate(`/properties/${encodeURIComponent(name)}`)
  }

  const handleClear = () => {
    navigate('/properties')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Intelligence</div>
        <div className="flex items-center gap-3">
          <Fingerprint size={20} className="text-coral" />
          <h1 className="text-2xl font-bold">Property Intelligence</h1>
        </div>
        <p className="text-ivory/50 text-sm mt-1">
          Everything known about a specific polluted property — sources, chains, gadgets, evidence.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && search.trim()) handleSelect(search.trim())
            }}
            placeholder="Search property name..."
            className="bg-surface border border-border rounded-sm pl-8 pr-3 py-2 text-sm text-ivory placeholder:text-ivory/30 outline-none focus:border-ivory/30 w-72"
          />
        </div>
        {selectedName && (
          <button
            onClick={handleClear}
            className="text-xs font-mono text-ivory/40 hover:text-ivory border border-border px-3 py-2 rounded-sm hover:border-ivory/30 transition-colors"
          >
            ← All Properties
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedName ? (
          <motion.div key={selectedName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PropertyDetail name={selectedName} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PropertyList properties={filtered} onSelect={handleSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
