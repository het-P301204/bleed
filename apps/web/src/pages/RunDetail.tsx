import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { StatusBadge } from '../components/common/Badge'
import ObjectInspector from '../components/common/ObjectInspector'
import Timeline from '../components/common/Timeline'
import EvidencePanel from '../components/evidence/EvidencePanel'
import ReplayControls from '../components/run/ReplayControls'
import BleedPathAnimation from '../components/chain/BleedPathAnimation'
import { mockObjectStates } from '../api/mockData'
import { useRunsStore } from '../store/runs'

export default function RunDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { runs, setActiveRun, replayIndex, setReplayIndex } = useRunsStore()
  const run = runs.find(r => r.id === id)

  useEffect(() => {
    if (run) setActiveRun(run)
    return () => setActiveRun(null)
  }, [run, setActiveRun])

  if (!run) {
    return <div className="text-center py-20 text-ivory/30 text-sm font-mono">Run not found</div>
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${run.id}.json`
    a.click()
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <button onClick={() => nav('/runs')} className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors">
        <ArrowLeft size={16} /> Back to Runs
      </button>

      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-mono text-xs text-ivory/40">{run.id}</span>
          <StatusBadge status={run.result} size="md" />
          <StatusBadge status={run.mitigationState} />
        </div>
        <h1 className="text-xl font-bold mb-1">{run.chain.name}</h1>
        <div className="text-xs font-mono text-ivory/40 mb-4">{run.scenarioId}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono border-t border-border pt-4">
          <div><span className="text-ivory/30 block mb-0.5">Duration</span><span className="text-ivory/70">{run.duration}ms</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Events</span><span className="text-ivory/70">{run.events.length}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Evidence</span><span className="text-ivory/70">{run.evidence.length}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Fixture</span><span className="text-ivory/70">{run.fixtureId} v{run.fixtureVersion}</span></div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={exportJson}
            className="flex items-center gap-2 border border-border text-ivory/50 text-xs font-mono px-3 py-1.5 rounded hover:border-ivory/30 hover:text-ivory transition-colors"
          >
            <Download size={12} /> Export JSON
          </button>
        </div>
      </div>

      {/* Pollution Flow */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Pollution Flow</h2>
        <BleedPathAnimation chain={run.chain} autoPlay={false} />
      </div>

      {/* Replay Controls + Timeline */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Runtime Events</h2>
        <ReplayControls />
        <div className="mt-6">
          <Timeline
            events={run.events}
            activeIndex={replayIndex}
            onSelect={setReplayIndex}
          />
        </div>
      </div>

      {/* Object State Diff */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Object State Diff</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono text-ivory/40 mb-2">BEFORE</div>
            <ObjectInspector state={mockObjectStates[0]!} />
          </div>
          <div>
            <div className="text-xs font-mono text-coral/60 mb-2">AFTER POLLUTION</div>
            <ObjectInspector state={mockObjectStates[1]!} />
          </div>
        </div>
      </div>

      {/* Packages */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Package Versions</h2>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(run.packageVersions).map(([pkg, ver]) => (
            <span key={pkg} className="font-mono text-xs text-ivory/50 border border-border px-2 py-1 rounded">
              {pkg}@{String(ver)}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence */}
      <EvidencePanel evidence={run.evidence} />

      {/* Disclaimer */}
      <div className="border border-border rounded px-4 py-3 text-xs font-mono text-ivory/20">
        CONTROLLED LAB IMPACT — synthetic data only. Fixture: {run.fixtureId} v{run.fixtureVersion}
      </div>
    </div>
  )
}
