import { useNavigate } from 'react-router-dom'
import { StatusBadge, Badge } from '../components/common/Badge'
import { mockRuns } from '../api/mockData'
import { Download } from 'lucide-react'

export default function Runs() {
  const nav = useNavigate()

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Research</div>
        <h1 className="text-2xl font-bold">Research Runs</h1>
        <p className="text-ivory/50 text-sm mt-1">Recorded controlled research demonstrations with full event timelines and evidence.</p>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">RUN-ID</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Scenario</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Chain</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Status</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Mitigation</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {mockRuns.map((run, i) => (
              <tr
                key={run.id}
                onClick={() => nav(`/runs/${run.id}`)}
                className={`border-b border-border hover:bg-white/5 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-ivory/50">{run.id}</td>
                <td className="px-4 py-3 text-xs text-ivory/70 font-mono">{run.scenarioId}</td>
                <td className="px-4 py-3 text-xs text-ivory/60 max-w-[180px] truncate">{run.chain.name}</td>
                <td className="px-4 py-3"><StatusBadge status={run.result} /></td>
                <td className="px-4 py-3"><StatusBadge status={run.mitigationState} /></td>
                <td className="px-4 py-3 font-mono text-xs text-ivory/40">{run.duration}ms</td>
                <td className="px-4 py-3 font-mono text-xs text-ivory/30">
                  {new Date(run.timestamp).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={e => { e.stopPropagation() }}
                    className="text-ivory/20 hover:text-ivory/60 transition-colors"
                  >
                    <Download size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {mockRuns.map(run => (
          <button
            key={run.id}
            onClick={() => nav(`/runs/${run.id}`)}
            className="text-left bg-surface border border-border hover:border-ivory/20 rounded-md p-4 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-ivory/30">{run.id}</span>
              <StatusBadge status={run.result} />
              <StatusBadge status={run.mitigationState} />
            </div>
            <div className="font-medium text-ivory text-sm truncate">{run.chain.name}</div>
            <div className="flex gap-3 mt-2 text-xs font-mono text-ivory/30">
              <span>{run.events.length} events</span>
              <span>{run.evidence.length} evidence</span>
              <span>{run.duration}ms</span>
              <span className="ml-auto">{new Date(run.timestamp).toLocaleString()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
