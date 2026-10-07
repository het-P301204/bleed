import type { Evidence } from '@bleed/shared'
import { FileCode, AlertTriangle, Clock } from 'lucide-react'

function EvidenceItem({ ev }: { ev: Evidence }) {
  return (
    <div className="border border-border rounded-md p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-ivory/40">{ev.id}</span>
        {ev.runtimeEvent && (
          <span className="text-xs font-mono text-marigold border border-marigold/30 px-1.5 py-0.5 rounded bg-marigold/5">
            {ev.runtimeEvent}
          </span>
        )}
      </div>

      <p className="text-sm text-ivory/80 leading-snug">{ev.description}</p>

      {ev.sourceFile && (
        <div className="flex items-center gap-2 text-xs font-mono text-ivory/40">
          <FileCode size={12} />
          <span>{ev.sourceFile}</span>
          {ev.sourceLine && <span className="text-ivory/25">:{ev.sourceLine}</span>}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs font-mono text-ivory/30">
        <div className="flex items-center gap-1">
          <AlertTriangle size={10} />
          <span>.{ev.property}</span>
          <span className="text-ivory/20">from {ev.origin}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock size={10} />
          <span>{new Date(ev.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {ev.impact && (
        <div className="text-xs font-mono text-coral/70 border border-coral/20 px-2 py-1 rounded bg-coral/5">
          CONTROLLED LAB IMPACT — {ev.impact}
        </div>
      )}
    </div>
  )
}

interface EvidencePanelProps {
  evidence: Evidence[]
  title?: string
}

export default function EvidencePanel({ evidence, title = 'Evidence' }: EvidencePanelProps) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-md border border-border p-6 text-center">
        <p className="text-ivory/30 text-sm font-mono">No evidence collected yet</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-ivory/60 mb-3 uppercase tracking-wider">{title}</h3>
      <div className="space-y-3">
        {evidence.map(ev => <EvidenceItem key={ev.id} ev={ev} />)}
      </div>
    </div>
  )
}
