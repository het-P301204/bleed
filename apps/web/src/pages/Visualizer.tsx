import { useState } from 'react'
import { StatusBadge } from '../components/common/Badge'
import PrototypeChainGraph from '../components/graph/PrototypeChainGraph'
import { mockChains } from '../api/mockData'
import type { Chain, ChainNode, ChainEdge } from '@bleed/shared'

export default function Visualizer() {
  const [selectedChain, setSelectedChain] = useState<Chain>(mockChains[0]!)

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Visualizer</div>
        <h1 className="text-2xl font-bold">Prototype Chain Visualizer</h1>
        <p className="text-ivory/50 text-sm mt-1">Interactive graph of the complete prototype pollution chain. Click nodes to inspect evidence.</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        {mockChains.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedChain(c)}
            className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
              selectedChain.id === c.id ? 'border-coral text-coral bg-coral/5' : 'border-border text-ivory/40 hover:border-ivory/20'
            }`}
          >
            {c.id}
            <StatusBadge status={c.status} />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="text-ivory/30">Chain: </span>
        <span className="text-ivory font-medium">{selectedChain.name}</span>
        <span className="text-coral">.{selectedChain.property}</span>
        <StatusBadge status={selectedChain.status} />
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[
          { type: 'INPUT', color: 'border-ivory/40 text-ivory/60' },
          { type: 'PARSER/MERGE', color: 'border-marigold/50 text-marigold' },
          { type: 'PROTOTYPE', color: 'border-coral text-coral' },
          { type: 'OBJECT', color: 'border-iris/50 text-iris' },
          { type: 'GADGET', color: 'border-coral/70 text-coral/70' },
          { type: 'IMPACT', color: 'border-coral text-coral font-bold' },
        ].map(({ type, color }) => (
          <div key={type} className={`flex items-center gap-1.5 text-xs font-mono ${color}`}>
            <div className={`w-3 h-3 border rounded-sm ${color}`} />
            {type}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs font-mono text-ivory/30 ml-4">
          <div className="w-6 h-px border-t border-dashed border-border" /> INHERITS (animated)
        </div>
      </div>

      <PrototypeChainGraph chain={selectedChain} />

      {/* Info panel */}
      <div className="grid md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-surface border border-border rounded-md p-4">
          <div className="text-ivory/30 mb-2 uppercase tracking-wider">Nodes</div>
          <div className="space-y-1">
            {selectedChain.nodes.map((n: ChainNode) => (
              <div key={n.id} className="flex justify-between text-ivory/50">
                <span>{n.label.slice(0, 24)}</span>
                <span className="text-ivory/25">{n.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-md p-4">
          <div className="text-ivory/30 mb-2 uppercase tracking-wider">Edges</div>
          <div className="space-y-1">
            {selectedChain.edges.map((e: ChainEdge, i: number) => (
              <div key={i} className="flex justify-between text-ivory/50">
                <span>{e.from.slice(2, 8)} → {e.to.slice(2, 8)}</span>
                <span className="text-ivory/25">{e.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-md p-4">
          <div className="text-ivory/30 mb-2 uppercase tracking-wider">Properties</div>
          <div className="space-y-1">
            <div className="flex justify-between text-ivory/50">
              <span>Polluted</span><span className="text-coral">.{selectedChain.property}</span>
            </div>
            <div className="flex justify-between text-ivory/50">
              <span>Impact</span><span>{selectedChain.impact.replace('SYNTHETIC_', '')}</span>
            </div>
            <div className="flex justify-between text-ivory/50">
              <span>Status</span><StatusBadge status={selectedChain.status} />
            </div>
            <div className="flex justify-between text-ivory/50">
              <span>Evidence</span><span>{selectedChain.evidence.length} items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
