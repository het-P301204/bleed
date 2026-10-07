import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import { mockChains, mockSources, mockGadgets } from '../api/mockData'

export default function Chains() {
  const nav = useNavigate()

  const sourceMap = Object.fromEntries(mockSources.map(s => [s.id, s]))
  const gadgetMap = Object.fromEntries(mockGadgets.map(g => [g.id, g]))

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Library</div>
          <h1 className="text-2xl font-bold">Chain Library</h1>
          <p className="text-ivory/50 text-sm mt-1">Complete source → gadget → impact chains with evidence and hardening status.</p>
        </div>
        <button
          onClick={() => nav('/chains/new')}
          className="flex items-center gap-2 bg-coral text-graphite text-sm font-semibold px-4 py-2 rounded-sm hover:bg-coral/90 transition-colors"
        >
          <Plus size={14} /> Build Chain
        </button>
      </div>

      {/* Matrix table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">ID</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Source</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Property</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Gadget</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Impact</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Status</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Confidence</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Hardened</th>
            </tr>
          </thead>
          <tbody>
            {mockChains.map((chain, i) => {
              const src = sourceMap[chain.sourceId]
              const gad = gadgetMap[chain.gadgetIds[0] ?? '']
              return (
                <tr
                  key={chain.id}
                  onClick={() => nav(`/chains/${chain.id}`)}
                  className={`border-b border-border hover:bg-white/5 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-ivory/40">{chain.id}</td>
                  <td className="px-4 py-3 text-xs text-ivory/70">{src?.name ?? chain.sourceId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-coral">.{chain.property}</td>
                  <td className="px-4 py-3 text-xs text-ivory/70">{gad?.library ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-ivory/50">{chain.impact.replace('SYNTHETIC_', '')}</td>
                  <td className="px-4 py-3"><StatusBadge status={chain.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={chain.confidence} /></td>
                  <td className="px-4 py-3">
                    {chain.mitigation ? (
                      <span className="text-xs font-mono text-sage">✓</span>
                    ) : (
                      <span className="text-xs font-mono text-ivory/20">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards view */}
      <div className="grid md:grid-cols-2 gap-4 pt-4">
        {mockChains.map(chain => (
          <button
            key={chain.id}
            onClick={() => nav(`/chains/${chain.id}`)}
            className="text-left bg-surface border border-border hover:border-ivory/20 rounded-md p-5 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs text-ivory/30">{chain.id}</span>
              <StatusBadge status={chain.status} />
              <StatusBadge status={chain.confidence} />
            </div>
            <div className="font-semibold text-ivory text-sm mb-2">{chain.name}</div>
            <div className="flex items-center gap-2 text-xs font-mono text-ivory/40">
              <span className="text-coral">.{chain.property}</span>
              <span>→</span>
              <span className="text-ivory/50">{chain.impact.replace('SYNTHETIC_', '')}</span>
            </div>
            <div className="mt-3 text-xs font-mono text-ivory/20">
              {chain.nodes.length} nodes · {chain.edges.length} edges · {chain.evidence.length} evidence
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
