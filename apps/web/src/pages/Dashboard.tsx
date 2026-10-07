import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, ExternalLink } from 'lucide-react'
import MetricCard from '../components/common/MetricCard'
import { StatusBadge } from '../components/common/Badge'
import { mockChains, mockEvidence } from '../api/mockData'
import { useRunsStore } from '../store/runs'

// Dashboard sub-components
import ActivityFeed from '../components/dashboard/ActivityFeed'
import ResearchHeatmap from '../components/dashboard/ResearchHeatmap'
import AttentionCenter from '../components/dashboard/AttentionCenter'
import SystemStatus from '../components/dashboard/SystemStatus'
import ResearchInsights from '../components/dashboard/ResearchInsights'

// ─── PropagationHeatmap (kept from original) ─────────────────────────────────

function PropagationHeatmap() {
  const runs = useRunsStore(s => s.runs)
  const propertyCounts = runs.reduce<Record<string, { reproduced: number; blocked: number; other: number }>>(
    (acc, r) => {
      const prop = r.chain?.property ?? 'unknown'
      if (!acc[prop]) acc[prop] = { reproduced: 0, blocked: 0, other: 0 }
      if (r.result === 'REPRODUCED') acc[prop]!.reproduced++
      else if (r.result === 'BLOCKED') acc[prop]!.blocked++
      else acc[prop]!.other++
      return acc
    },
    {}
  )

  const sorted = Object.entries(propertyCounts).sort(
    ([, a], [, b]) => b.reproduced + b.blocked - (a.reproduced + a.blocked)
  )
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
                <div
                  title={`${counts.reproduced} reproduced`}
                  className="h-full bg-coral/70 transition-all"
                  style={{ width: `${(counts.reproduced / max) * 100}%` }}
                />
              )}
              {counts.blocked > 0 && (
                <div
                  title={`${counts.blocked} blocked`}
                  className="h-full bg-sage/70 transition-all"
                  style={{ width: `${(counts.blocked / max) * 100}%` }}
                />
              )}
              {counts.other > 0 && (
                <div
                  title={`${counts.other} other`}
                  className="h-full bg-marigold/40 transition-all"
                  style={{ width: `${(counts.other / max) * 100}%` }}
                />
              )}
            </div>
            <span className="text-xs font-mono text-ivory/30 w-4 flex-shrink-0">{total}</span>
          </div>
        )
      })}
      <div className="flex gap-4 mt-3 text-xs font-mono text-ivory/30">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-coral/70" /> reproduced
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-sage/70" /> blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-marigold/40" /> other
        </span>
      </div>
    </div>
  )
}

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">{title}</h2>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-xs text-ivory/40 hover:text-ivory flex items-center gap-1 transition-colors"
        >
          {action} <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const nav = useNavigate()
  const runs = useRunsStore(s => s.runs)
  const recentRuns = runs.slice(0, 5)
  const liveRunCount = runs.filter(r => !r.id.startsWith('run-')).length

  // Hardcoded expanded-dataset numbers per spec
  const expandedSources = 20
  const expandedGadgets = 36
  const expandedChains = 20
  const expandedRuns = 30
  const expandedEvidence = 60

  return (
    <div className="space-y-8 max-w-6xl">

      {/* ── RESEARCH COVERAGE — 5 MetricCards ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">
              Research Coverage
            </h2>
            {liveRunCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-sage font-mono">
                <Zap size={11} className="text-sage" />
                {liveRunCount} live run{liveRunCount !== 1 ? 's' : ''} this session
              </div>
            )}
          </div>
          <button
            onClick={() => nav('/showcase')}
            className="flex items-center gap-1.5 text-xs font-mono text-ivory/40 hover:text-ivory border border-border hover:border-ivory/20 rounded px-3 py-1 transition-colors"
          >
            SHOWCASE <ExternalLink size={11} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Sources" value={expandedSources} accent="marigold" />
          <MetricCard label="Gadgets" value={expandedGadgets} accent="iris" />
          <MetricCard label="Chains" value={expandedChains} accent="coral" />
          <MetricCard label="Runs" value={expandedRuns} accent="coral" />
          <MetricCard label="Evidence" value={expandedEvidence} accent="sage" />
        </div>
      </div>

      {/* ── RESEARCH HEATMAP + SYSTEM STATUS ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <SectionHeader title="Research Heatmap" />
          <div className="bg-surface border border-border rounded-md p-4">
            <ResearchHeatmap />
          </div>
        </div>
        <div>
          <SectionHeader title="System Status" />
          <div className="bg-surface border border-border rounded-md p-4">
            <SystemStatus />
          </div>
        </div>
      </div>

      {/* ── ATTENTION CENTER + RESEARCH INSIGHTS ───────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <SectionHeader title="Attention" />
          <AttentionCenter />
        </div>
        <div>
          <SectionHeader title="Research Insights" />
          <ResearchInsights />
        </div>
      </div>

      {/* ── LIVE RESEARCH ACTIVITY ──────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Live Research Activity" />
        <ActivityFeed />
      </div>

      {/* ── RECENT RUNS + PROPERTY HEATMAP ──────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Runs */}
        <div>
          <SectionHeader title="Recent Runs" action="View all" onAction={() => nav('/runs')} />
          <div className="space-y-2">
            {recentRuns.map(run => (
              <button
                key={run.id}
                onClick={() => nav(`/runs/${run.id}`)}
                className="w-full flex items-center gap-3 bg-surface border border-border hover:border-ivory/20 rounded-md px-4 py-3 text-left transition-colors"
              >
                <span className="font-mono text-xs text-ivory/30 w-28 flex-shrink-0 truncate">
                  {run.id.slice(0, 8)}…
                </span>
                <span className="text-sm text-ivory flex-1 truncate">{run.chain.name}</span>
                <StatusBadge status={run.result} />
              </button>
            ))}
          </div>
        </div>

        {/* Property Propagation Heatmap */}
        <div>
          <SectionHeader title="Property Propagation Heatmap" />
          <div className="bg-surface border border-border rounded-md p-4">
            <PropagationHeatmap />
          </div>
        </div>
      </div>

      {/* ── SOURCE → IMPACT MATRIX ──────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Source → Impact Matrix"
          action="View all chains"
          onAction={() => nav('/chains')}
        />
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
                  className={`border-b border-border hover:bg-white/5 cursor-pointer transition-colors ${
                    i % 2 === 0 ? '' : 'bg-surface/20'
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-ivory/60">{chain.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-coral">.{chain.property}</td>
                  <td className="px-4 py-2.5 text-xs text-ivory/60">
                    {chain.impact.replace('SYNTHETIC_', '')}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={chain.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── LATEST EVIDENCE (kept from original) ────────────────────────────── */}
      <div>
        <SectionHeader
          title="Latest Evidence"
          action="View all"
          onAction={() => nav('/evidence')}
        />
        <div className="space-y-2">
          {mockEvidence.slice(0, 3).map(ev => (
            <div
              key={ev.id}
              className="bg-surface border border-border rounded-md px-4 py-3 flex items-center gap-3"
            >
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
