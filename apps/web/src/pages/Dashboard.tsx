import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import { StatusBadge } from '../components/common/Badge'
import LabServiceStatus from '../components/lab/LabServiceStatus'
import { mockMetrics, mockLabState, mockChains, mockEvidence, mockGadgets } from '../api/mockData'
import { useRunsStore } from '../store/runs'

function PropagationHeatmap() {
  const runs = useRunsStore(s => s.runs)
  const propertyCounts = runs.reduce<Record<string, { reproduced: number; blocked: number; other: number }>>((acc, r) => {
    const prop = r.chain?.property ?? 'unknown'
    if (!acc[prop]) acc[prop] = { reproduced: 0, blocked: 0, other: 0 }
    if (r.result === 'REPRODUCED') acc[prop]!.reproduced++
    else if (r.result === 'BLOCKED') acc[prop]!.blocked++
    else acc[prop]!.other++
    return acc
  }, {})

  const sorted = Object.entries(propertyCounts).sort(([, a], [, b]) => (b.reproduced + b.blocked) - (a.reproduced + a.blocked))
  const max = Math.max(...sorted.map(([, v]) => v.reproduced + v.blocked + v.other), 1)

  return (
    <div className="space-y-2">
      {sorted.slice(0, 8).map(([prop, counts]) => {
        const total = counts.reproduced + counts.blocked + counts.other
        return (
          <div key={prop} className="flex items-center gap-3">
            <span className="font-mono text-xs text-coral w-24 flex-shrink-0 truncate">.{prop}</span>
            <div className="flex-1 h-4 bg-border/60 rounded-sm overflow-hidden flex">
              {counts.reproduced > 0 && (
                <div title={`${counts.reproduced} reproduced`} className="h-full bg-coral/70 transition-all" style={{ width: `${(counts.reproduced / max) * 100}%` }} />
              )}
              {counts.blocked > 0 && (
                <div title={`${counts.blocked} blocked`} className="h-full bg-sage/70 transition-all" style={{ width: `${(counts.blocked / max) * 100}%` }} />
              )}
              {counts.other > 0 && (
                <div title={`${counts.other} other`} className="h-full bg-marigold/40 transition-all" style={{ width: `${(counts.other / max) * 100}%` }} />
              )}
            </div>
            <span className="text-xs font-mono text-ivory/30 w-4 flex-shrink-0">{total}</span>
          </div>
        )
      })}
      <div className="flex gap-4 mt-3 text-xs font-mono text-ivory/30">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-coral/70" /> reproduced</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-sage/70" /> blocked</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-marigold/40" /> other</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const metrics = mockMetrics
  const lab = mockLabState
  const runs = useRunsStore(s => s.runs)
  const recentRuns = runs.slice(0, 5)

  const gadgetsByCategory = mockGadgets.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1
    return acc
  }, {})

  const liveRunCount = runs.filter(r => !r.id.startsWith('run-')).length

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">Overview</h2>
          {liveRunCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-sage font-mono">
              <Zap size={11} className="text-sage" />
              {liveRunCount} live run{liveRunCount !== 1 ? 's' : ''} this session
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Sources" value={metrics.sources} accent="marigold" />
          <MetricCard label="Gadgets" value={metrics.gadgets} accent="iris" />
          <MetricCard label="Reachable" value={metrics.reachableChains} accent="coral" />
          <MetricCard label="Reproduced" value={metrics.reproducedChains} accent="coral" />
          <MetricCard label="Blocked" value={metrics.hardenedBlocked} accent="sage" />
        </div>
      </div>

      {/* Lab Status */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">Lab Status</h2>
          <StatusBadge status={lab.status} />
        </div>
        <LabServiceStatus services={lab.services} />
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Runs — live from store */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">Recent Runs</h2>
            <button onClick={() => nav('/runs')} className="text-xs text-ivory/40 hover:text-ivory flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentRuns.map(run => (
              <button
                key={run.id}
                onClick={() => nav(`/runs/${run.id}`)}
                className="w-full flex items-center gap-3 bg-surface border border-border hover:border-ivory/20 rounded-md px-4 py-3 text-left transition-colors group"
              >
                <span className="font-mono text-xs text-ivory/30 w-28 flex-shrink-0 truncate">{run.id.slice(0, 8)}…</span>
                <span className="text-sm text-ivory flex-1 truncate">{run.chain.name}</span>
                <StatusBadge status={run.result} />
              </button>
            ))}
          </div>
        </div>

        {/* Gadget Categories */}
        <div>
          <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Gadget Categories</h2>
          <div className="space-y-2">
            {Object.entries(gadgetsByCategory).map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs font-mono text-ivory/50 w-28 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-iris/50 rounded-full"
                    style={{ width: `${(count / mockGadgets.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-ivory/40 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Propagation Heatmap */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Property Propagation Heatmap</h2>
        <div className="bg-surface border border-border rounded-md p-4">
          <PropagationHeatmap />
        </div>
      </div>

      {/* Chain Matrix */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Source → Impact Matrix</h2>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th className="text-left px-4 py-2.5 text-xs font-mono text-ivory/40">Chain</th>
                <th className="text-left px-4 py-2.5 text-xs font-mono text-ivory/40">Property</th>
                <th className="text-left px-4 py-2.5 text-xs font-mono text-ivory/40">Impact</th>
                <th className="text-left px-4 py-2.5 text-xs font-mono text-ivory/40">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockChains.map((chain, i) => (
                <tr
                  key={chain.id}
                  onClick={() => nav(`/chains/${chain.id}`)}
                  className={`border-b border-border hover:bg-white/5 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-ivory/60">{chain.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-coral">.{chain.property}</td>
                  <td className="px-4 py-2.5 text-xs text-ivory/60">{chain.impact.replace('SYNTHETIC_', '')}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={chain.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Evidence */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Latest Evidence</h2>
        <div className="space-y-2">
          {mockEvidence.slice(0, 3).map(ev => (
            <div key={ev.id} className="bg-surface border border-border rounded-md px-4 py-3 flex items-center gap-3">
              <span className="font-mono text-xs text-ivory/30 w-20 flex-shrink-0">{ev.id}</span>
              <span className="text-xs font-mono text-coral/70">.{ev.property}</span>
              <span className="text-sm text-ivory/70 flex-1 truncate">{ev.description}</span>
              {ev.runtimeEvent && <StatusBadge status={ev.runtimeEvent} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
