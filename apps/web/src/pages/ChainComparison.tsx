import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, ChevronDown } from 'lucide-react'
import { StatusBadge } from '../components/common/Badge'
import BleedPathAnimation from '../components/chain/BleedPathAnimation'
import { mockChains, mockEvidence } from '../api/mockData'
import type { Chain } from '@bleed/shared'

// ─── Comparison dimensions ────────────────────────────────────────────────────

interface Dimension {
  label: string
  get: (c: Chain) => React.ReactNode
}

const dimensions: Dimension[] = [
  {
    label: 'Source',
    get: c => <span className="font-mono text-xs text-ivory/70">{c.sourceId}</span>,
  },
  {
    label: 'Property',
    get: c => <span className="font-mono text-xs text-coral">.{c.property}</span>,
  },
  {
    label: 'Propagation depth',
    get: c => <span className="font-mono text-xs text-ivory/70">{c.nodes.length} nodes</span>,
  },
  {
    label: 'Gadget',
    get: c => <span className="font-mono text-xs text-iris">{c.gadgetIds.join(', ')}</span>,
  },
  {
    label: 'Impact',
    get: c => <span className="font-mono text-xs text-coral/80">{c.impact}</span>,
  },
  {
    label: 'Status',
    get: c => <StatusBadge status={c.status} />,
  },
  {
    label: 'Confidence',
    get: c => <StatusBadge status={c.confidence} />,
  },
  {
    label: 'Evidence',
    get: c => <span className="font-mono text-xs text-ivory/70">{c.evidence.length} record{c.evidence.length !== 1 ? 's' : ''}</span>,
  },
  {
    label: 'Chain ID',
    get: c => <span className="font-mono text-xs text-ivory/40">{c.id}</span>,
  },
  {
    label: 'Mitigation verified',
    get: c => c.mitigation
      ? <span className={`font-mono text-xs ${c.mitigation.verified ? 'text-sage' : 'text-marigold'}`}>{c.mitigation.verified ? '✓ Verified' : '⚠ Unverified'}</span>
      : <span className="font-mono text-xs text-ivory/30">—</span>,
  },
]

// ─── Chain select dropdown ────────────────────────────────────────────────────

interface ChainSelectProps {
  slot: 'A' | 'B'
  selected: Chain | null
  onSelect: (c: Chain | null) => void
}

function ChainSelect({ slot, selected, onSelect }: ChainSelectProps) {
  const [open, setOpen] = useState(false)

  const slotColor = slot === 'A' ? 'text-coral border-coral/30' : 'text-iris border-iris/30'
  const slotBg = slot === 'A' ? 'bg-coral/5 hover:bg-coral/10' : 'bg-iris/5 hover:bg-iris/10'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 border rounded-md transition-colors ${slotColor} ${slotBg}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold shrink-0">CHAIN {slot}</span>
          {selected ? (
            <span className="text-sm text-ivory font-medium truncate">{selected.name}</span>
          ) : (
            <span className="text-sm text-ivory/30 italic">Select a chain…</span>
          )}
        </div>
        <ChevronDown size={14} className="shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-md shadow-xl overflow-hidden"
          >
            <button
              onClick={() => { onSelect(null); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-ivory/30 italic hover:bg-white/5 transition-colors border-b border-border"
            >
              — Clear selection
            </button>
            {mockChains.map(c => (
              <button
                key={c.id}
                onClick={() => { onSelect(c); setOpen(false) }}
                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${selected?.id === c.id ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-ivory/30">{c.id}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-sm text-ivory leading-snug">{c.name}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

// ─── Empty slot placeholder ───────────────────────────────────────────────────

function EmptySlot({ slot }: { slot: 'A' | 'B' }) {
  const slotColor = slot === 'A' ? 'border-coral/20 text-coral/30' : 'border-iris/20 text-iris/30'
  return (
    <div className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center py-20 gap-3 ${slotColor}`}>
      <GitCompare size={32} className="opacity-40" />
      <div className="font-mono text-sm tracking-widest">SELECT A CHAIN</div>
      <div className="font-mono text-xs opacity-60">Use the dropdown above</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChainComparison() {
  const [chainA, setChainA] = useState<Chain | null>(null)
  const [chainB, setChainB] = useState<Chain | null>(null)

  const bothSelected = chainA !== null && chainB !== null

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Analysis</div>
        <div className="flex items-center gap-3">
          <GitCompare size={20} className="text-coral" />
          <h1 className="text-2xl font-bold">Chain Comparison</h1>
        </div>
        <p className="text-ivory/50 text-sm mt-1">
          Select two attack chains and compare them side-by-side across all dimensions.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <ChainSelect slot="A" selected={chainA} onSelect={setChainA} />
        <ChainSelect slot="B" selected={chainB} onSelect={setChainB} />
      </div>

      {/* Comparison table */}
      <AnimatePresence>
        {bothSelected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-surface/80 border-b border-border text-xs font-mono text-ivory/40 uppercase tracking-wider">
                <div className="px-4 py-3">Dimension</div>
                <div className="px-4 py-3 border-l border-border text-coral">Chain A — {chainA!.id}</div>
                <div className="px-4 py-3 border-l border-border text-iris">Chain B — {chainB!.id}</div>
              </div>
              {dimensions.map((dim, i) => (
                <motion.div
                  key={dim.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="grid grid-cols-3 border-b border-border last:border-0 hover:bg-white/2 transition-colors"
                >
                  <div className="px-4 py-3 text-xs font-mono text-ivory/50">{dim.label}</div>
                  <div className="px-4 py-3 border-l border-border">{dim.get(chainA!)}</div>
                  <div className="px-4 py-3 border-l border-border">{dim.get(chainB!)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain animations */}
      <div className="flex gap-4">
        {chainA ? (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-mono text-coral uppercase tracking-widest mb-2">Chain A — {chainA.id}</div>
            <BleedPathAnimation chain={chainA} autoPlay />
          </motion.div>
        ) : (
          <EmptySlot slot="A" />
        )}

        {chainB ? (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="text-xs font-mono text-iris uppercase tracking-widest mb-2">Chain B — {chainB.id}</div>
            <BleedPathAnimation chain={chainB} autoPlay />
          </motion.div>
        ) : (
          <EmptySlot slot="B" />
        )}
      </div>

      {/* Hint when nothing selected */}
      {!chainA && !chainB && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-ivory/20 font-mono text-sm">
            Select chains from the dropdowns above to begin comparison.
          </div>
        </motion.div>
      )}
    </div>
  )
}
