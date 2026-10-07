import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, GitCompare } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import CodeBlock, { CodeDiff } from '../components/common/CodeBlock'
import ObjectInspector from '../components/common/ObjectInspector'
import EvidencePanel from '../components/evidence/EvidencePanel'
import ResearchNote from '../components/common/ResearchNote'
import { mockSources, mockObjectStates } from '../api/mockData'

export default function SourceDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const source = mockSources.find(s => s.id === id)

  if (!source) {
    return (
      <div className="text-center py-20 text-ivory/30">
        <div className="text-4xl font-mono mb-2">404</div>
        <div className="text-sm">Source not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back */}
      <button onClick={() => nav('/sources')} className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors">
        <ArrowLeft size={16} /> Back to Sources
      </button>

      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-mono text-xs text-ivory/30">{source.id}</span>
          <Badge label={source.category} variant="plum" />
          <StatusBadge status={source.status} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{source.name}</h1>
        <p className="text-ivory/60 text-sm leading-relaxed mb-4">{source.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono border-t border-border pt-4">
          <div><span className="text-ivory/30 block mb-0.5">File</span><span className="text-ivory/70">{source.file}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Function</span><span className="text-ivory/70">{source.functionName}()</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Property</span><span className="text-coral">.{source.property}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Fixture</span><span className="text-ivory/70">{source.fixtureId}</span></div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => nav('/chains/new')}
            className="flex items-center gap-2 bg-coral text-graphite text-sm font-semibold px-4 py-2 rounded-sm hover:bg-coral/90 transition-colors"
          >
            <Play size={14} /> Run Scenario
          </button>
          <button className="flex items-center gap-2 border border-border text-ivory/60 text-sm px-4 py-2 rounded-sm hover:border-ivory/30 hover:text-ivory transition-colors">
            <GitCompare size={14} /> Compare Hardened
          </button>
        </div>
      </div>

      {/* Object State Before/After */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Object State</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono text-ivory/40 mb-2">BEFORE pollution</div>
            <ObjectInspector state={mockObjectStates[0]!} />
          </div>
          <div>
            <div className="text-xs font-mono text-coral/60 mb-2">AFTER pollution</div>
            <ObjectInspector state={mockObjectStates[1]!} />
          </div>
        </div>
      </div>

      {/* Code comparison */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Code Comparison</h2>
        <CodeDiff
          before={source.vulnerableCode}
          after={source.hardenedCode ?? '// No hardened variant available'}
          beforeLabel="VULNERABLE"
          afterLabel="HARDENED"
        />
      </div>

      {/* Evidence */}
      <div>
        <EvidencePanel evidence={source.evidence} title="Source Evidence" />
      </div>

      {/* Research Notes */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Research Notes</h2>
        <ResearchNote entityId={source.id} entityType="source" entityLabel={source.name} />
      </div>
    </div>
  )
}
