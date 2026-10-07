import { useState, useEffect } from 'react'
import { RefreshCw, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import { StatusBadge } from '../components/common/Badge'
import LabServiceStatus from '../components/lab/LabServiceStatus'
import LabTopology from '../components/lab/LabTopology'
import MetricCard from '../components/common/MetricCard'
import ScenarioExecutor from '../components/lab/ScenarioExecutor'
import { mockLabState, mockMetrics } from '../api/mockData'
import { scenariosApi } from '../api/index'
import type { Scenario } from '@bleed/shared'

export default function Lab() {
  const [lab] = useState(mockLabState)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    scenariosApi.list().then(setScenarios)
  }, [])

  const uptime = lab.startedAt
    ? Math.floor((Date.now() - lab.startedAt) / 60000) + 'm'
    : '—'

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Status Banner */}
      <div className="flex items-center gap-4 bg-surface border border-border rounded-lg px-5 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${lab.status === 'READY' ? 'bg-sage animate-pulse' : 'bg-coral'}`} />
          <span className="font-medium text-ivory">Lab {lab.status}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-xs font-mono text-ivory/40">Uptime: {uptime}</span>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-mono text-ivory/40 hover:text-ivory border border-border px-3 py-1.5 rounded hover:border-ivory/30 transition-colors">
            <RefreshCw size={12} /> Restart
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Runs" value={mockMetrics.totalRuns} accent="iris" />
        <MetricCard label="Reproduced" value={mockMetrics.reproducedChains} accent="coral" />
        <MetricCard label="Blocked" value={mockMetrics.hardenedBlocked} accent="sage" />
        <MetricCard label="Reachable" value={mockMetrics.reachableChains} accent="marigold" />
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Services</h2>
        <LabServiceStatus services={lab.services} />
      </div>

      {/* Topology */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Network Topology</h2>
        <LabTopology lab={lab} />
      </div>

      {/* Scenario execution */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">Scenarios</h2>
          <span className="text-xs text-ivory/30 font-mono">{scenarios.length} available</span>
        </div>
        <div className="space-y-2">
          {scenarios.map(scn => {
            const open = selected === scn.id
            return (
              <div key={scn.id} className={`bg-surface border rounded-md overflow-hidden transition-colors ${open ? 'border-coral/40' : 'border-border hover:border-ivory/20'}`}>
                {/* Scenario header — click to toggle */}
                <button
                  className="w-full text-left px-4 py-4 flex items-center gap-3"
                  onClick={() => setSelected(open ? null : scn.id)}
                >
                  <StatusBadge status={scn.difficulty} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-ivory">{scn.name}</div>
                    <div className="flex items-center gap-2 text-xs font-mono text-ivory/30 mt-0.5">
                      <span className="text-marigold">.{scn.property}</span>
                      <span>→</span>
                      <span className="text-coral">{scn.impact.replace('SYNTHETIC_', '')}</span>
                      <span className="mx-1 text-border">·</span>
                      <span>{scn.labTarget}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-ivory/20">{scn.id}</span>
                  {open
                    ? <ChevronUp size={14} className="text-ivory/30 flex-shrink-0" />
                    : <ChevronDown size={14} className="text-ivory/30 flex-shrink-0" />
                  }
                </button>

                {/* Inline executor */}
                {open && (
                  <div className="px-4 pb-5 border-t border-border/60 pt-4">
                    <p className="text-xs text-ivory/40 mb-4">{scn.description}</p>
                    <ScenarioExecutor scenario={scn} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-border rounded-md px-4 py-3 text-xs font-mono text-ivory/25 flex items-start gap-2">
        <FlaskConical size={12} className="flex-shrink-0 mt-0.5" />
        <span>All lab impacts are CONTROLLED LAB IMPACT — synthetic data only. No real systems or networks are targeted. Lab operates on the isolated Docker network bleed_network.</span>
      </div>
    </div>
  )
}
