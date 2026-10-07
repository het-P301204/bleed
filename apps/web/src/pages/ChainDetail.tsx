import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, GitCompare, Download } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import BleedPathAnimation from '../components/chain/BleedPathAnimation'
import PrototypeChainGraph from '../components/graph/PrototypeChainGraph'
import ObjectInspector from '../components/common/ObjectInspector'
import Timeline from '../components/common/Timeline'
import EvidencePanel from '../components/evidence/EvidencePanel'
import ResearchNote from '../components/common/ResearchNote'
import ReplayControls from '../components/run/ReplayControls'
import { mockChains, mockObjectStates, mockSources, mockGadgets } from '../api/mockData'
import { useRunsStore } from '../store/runs'
import { useEffect } from 'react'
import type { ChainNode } from '@bleed/shared'

export default function ChainDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const chain = mockChains.find(c => c.id === id)
  const { runs, setActiveRun } = useRunsStore()
  const run = runs.find(r => r.chain.id === id)

  useEffect(() => {
    if (run) setActiveRun(run)
    return () => setActiveRun(null)
  }, [run, setActiveRun])

  const replayIndex = useRunsStore(s => s.replayIndex)

  if (!chain) {
    return <div className="text-center py-20 text-ivory/30 text-sm font-mono">Chain not found</div>
  }

  const source = mockSources.find(s => s.id === chain.sourceId)
  const gadgets = chain.gadgetIds.map((gid: string) => mockGadgets.find(g => g.id === gid)).filter(Boolean)

  return (
    <div className="space-y-8 max-w-4xl">
      <button onClick={() => nav('/chains')} className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors">
        <ArrowLeft size={16} /> Back to Chains
      </button>

      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        {run && (
          <div className="text-xs font-mono text-coral/60 border border-coral/20 rounded px-2 py-1 inline-block mb-3 bg-coral/5">
            CONTROLLED RESEARCH RUN — {run.id}
          </div>
        )}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-mono text-xs text-ivory/30">{chain.id}</span>
          <StatusBadge status={chain.status} size="md" />
          <StatusBadge status={chain.confidence} />
        </div>
        <h1 className="text-2xl font-bold mb-4">{chain.name}</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono border-t border-border pt-4">
          <div><span className="text-ivory/30 block mb-0.5">Source</span><span className="text-ivory/70">{source?.name ?? chain.sourceId}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Property</span><span className="text-coral">.{chain.property}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Impact</span><span className="text-ivory/70">{chain.impact.replace('SYNTHETIC_', '')}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Nodes</span><span className="text-ivory/70">{chain.nodes.length}</span></div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={() => nav('/lab')} className="flex items-center gap-2 bg-coral text-graphite text-sm font-semibold px-4 py-2 rounded-sm hover:bg-coral/90 transition-colors">
            <Play size={14} /> Run in Lab
          </button>
          <button className="flex items-center gap-2 border border-border text-ivory/60 text-sm px-4 py-2 rounded-sm hover:border-ivory/30 hover:text-ivory transition-colors">
            <GitCompare size={14} /> Compare Hardened
          </button>
          <button className="flex items-center gap-2 border border-border text-ivory/60 text-sm px-4 py-2 rounded-sm hover:border-ivory/30 hover:text-ivory transition-colors ml-auto">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* BleedPathAnimation — THE SIGNATURE ANIMATION */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Pollution Flow</h2>
        <BleedPathAnimation chain={chain} autoPlay={true} />
      </div>

      {/* React Flow Graph */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Prototype Chain Graph</h2>
        <PrototypeChainGraph chain={chain} />
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

      {/* Timeline + Replay */}
      {run && (
        <div>
          <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Runtime Timeline</h2>
          <ReplayControls />
          <div className="mt-4">
            <Timeline
              events={run.events}
              activeIndex={replayIndex}
              onSelect={i => useRunsStore.getState().setReplayIndex(i)}
            />
          </div>
        </div>
      )}

      {/* Hardened Comparison */}
      {chain.mitigation && (
        <div>
          <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Hardened Comparison</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-coral/30 rounded-md p-4 bg-coral/5">
              <div className="text-xs font-mono text-coral mb-3">VULNERABLE — chain flows, impact reached</div>
              <div className="space-y-1 text-xs font-mono text-ivory/50">
                {chain.nodes.map((n: ChainNode) => (
                  <div key={n.id} className="flex items-center gap-2">
                    <span className="text-coral/50">→</span>
                    <span>{n.label}</span>
                    {n.property && <span className="text-coral">.{n.property}</span>}
                  </div>
                ))}
                <div className="mt-2 text-coral font-medium">{chain.impact}</div>
              </div>
            </div>
            <div className="border border-sage/30 rounded-md p-4 bg-sage/5">
              <div className="text-xs font-mono text-sage mb-3">HARDENED — blocked at source, no inheritance</div>
              <div className="space-y-1 text-xs font-mono text-ivory/50">
                <div className="flex items-center gap-2">
                  <span className="text-marigold/50">→</span>
                  <span>{chain.nodes[0]?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-marigold/50">→</span>
                  <span>Merge key guard</span>
                </div>
                <div className="flex items-center gap-2 text-sage">
                  <span>⊗</span>
                  <span>__proto__ BLOCKED</span>
                </div>
                <div className="mt-2 text-sage font-medium">NO IMPACT — BLOCKED</div>
              </div>
              <div className="mt-3 text-xs text-ivory/40">{chain.mitigation.strategy}</div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence */}
      <EvidencePanel evidence={chain.evidence} />

      {/* Research Notes */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Research Notes</h2>
        <ResearchNote entityId={chain.id} entityType="chain" entityLabel={chain.name} />
      </div>

      {/* Lab disclaimer */}
      <div className="border border-border rounded px-4 py-3 text-xs font-mono text-ivory/20">
        CONTROLLED LAB IMPACT — synthetic data only. This research run was performed in an isolated Docker lab environment. No real systems were targeted.
      </div>
    </div>
  )
}
