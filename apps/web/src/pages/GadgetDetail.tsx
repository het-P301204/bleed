import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import CodeBlock from '../components/common/CodeBlock'
import EvidencePanel from '../components/evidence/EvidencePanel'
import ResearchNote from '../components/common/ResearchNote'
import { mockGadgets } from '../api/mockData'

export default function GadgetDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const gadget = mockGadgets.find(g => g.id === id)

  if (!gadget) {
    return <div className="text-center py-20 text-ivory/30 text-sm font-mono">Gadget not found</div>
  }

  const triggerCode = `// ${gadget.library} reads the property during: ${gadget.trigger}
// If Object.prototype.${gadget.property} is polluted, any object passed
// to this function will inherit the malicious value.

// Example exploitation:
Object.prototype["${gadget.property}"] = /* attacker value */

// The library then reads it without hasOwnProperty check:
const config = {}
console.log(config["${gadget.property}"]) // reads from prototype!`

  return (
    <div className="space-y-8 max-w-4xl">
      <button onClick={() => nav('/gadgets')} className="flex items-center gap-2 text-sm text-ivory/40 hover:text-ivory transition-colors">
        <ArrowLeft size={16} /> Back to Gadgets
      </button>

      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-mono text-xs text-ivory/30">{gadget.id}</span>
          <Badge label={gadget.category} variant="iris" />
          <StatusBadge status={gadget.status} />
        </div>
        <h1 className="text-2xl font-bold mb-1">{gadget.library}</h1>
        <div className="flex items-center gap-3 mb-4">
          {gadget.versionRange && (
            <span className="font-mono text-xs text-marigold border border-marigold/30 px-2 py-0.5 rounded bg-marigold/5">
              {gadget.versionRange}
            </span>
          )}
          <span className="text-ivory/30 text-xs font-mono">Target: {gadget.labTarget}</span>
        </div>
        <p className="text-ivory/60 text-sm leading-relaxed">{gadget.description}</p>

        <div className="grid grid-cols-3 gap-4 text-xs font-mono border-t border-border pt-4 mt-4">
          <div><span className="text-ivory/30 block mb-0.5">Property</span><span className="text-coral">.{gadget.property}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Trigger</span><span className="text-ivory/70 text-[10px]">{gadget.trigger}</span></div>
          <div><span className="text-ivory/30 block mb-0.5">Impact Class</span><span className="text-ivory/70">{gadget.impactClass.replace('SYNTHETIC_', '')}</span></div>
        </div>
      </div>

      {/* Why the property matters */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Why .{gadget.property} matters</h2>
        <div className="bg-surface border border-border rounded-md p-5 text-sm text-ivory/70 leading-relaxed">
          <p>
            The <code className="font-mono text-coral/80 bg-coral/5 px-1 rounded">.{gadget.property}</code> property is read by <strong className="text-ivory">{gadget.library}</strong> during <code className="font-mono text-marigold/80 text-xs">{gadget.trigger}</code> without a <code className="font-mono text-ivory/60 text-xs">hasOwnProperty</code> guard. If an attacker can write to <code className="font-mono text-coral/80 bg-coral/5 px-1 rounded">Object.prototype.{gadget.property}</code> via a pollution source, every plain object passed to this library function will appear to have that property — and the library will use the attacker-controlled value.
          </p>
        </div>
      </div>

      {/* Code */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Gadget Code Path</h2>
        <CodeBlock code={triggerCode} label="GADGET TRIGGER" variant="vulnerable" />
      </div>

      {/* Mitigation */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Mitigation</h2>
        <div className="bg-surface border border-sage/30 rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-sage border border-sage/30 px-2 py-0.5 rounded bg-sage/5">{gadget.mitigation.strategy}</span>
            {gadget.mitigation.verified && (
              <span className="text-xs font-mono text-sage/70">✓ Verified</span>
            )}
          </div>
          <p className="text-sm text-ivory/70">{gadget.mitigation.description}</p>
          {gadget.mitigation.codeExample && (
            <CodeBlock code={gadget.mitigation.codeExample} label="MITIGATION" variant="hardened" />
          )}
        </div>
      </div>

      {/* Evidence */}
      <EvidencePanel evidence={gadget.evidence} />

      {/* Research Notes */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-3">Research Notes</h2>
        <ResearchNote entityId={gadget.id} entityType="gadget" entityLabel={gadget.library} />
      </div>
    </div>
  )
}
