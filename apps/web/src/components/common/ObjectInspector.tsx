import { useState } from 'react'
import type { ObjectState, ObjectProperty } from '@bleed/shared'
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'

interface PropertyRowProps {
  prop: ObjectProperty
  inherited?: boolean
  onClick?: (prop: ObjectProperty) => void
}

function PropertyRow({ prop, inherited, onClick }: PropertyRowProps) {
  const valueStr = typeof prop.value === 'object'
    ? JSON.stringify(prop.value, null, 0).slice(0, 60)
    : String(prop.value)

  return (
    <button
      onClick={() => inherited && onClick?.(prop)}
      className={`w-full flex items-center gap-3 px-3 py-1.5 text-xs font-mono text-left rounded transition-colors group ${
        inherited
          ? 'text-coral hover:bg-coral/10 cursor-pointer'
          : 'text-ivory/70 hover:bg-white/5 cursor-default'
      }`}
    >
      {inherited && <AlertTriangle size={10} className="flex-shrink-0 text-coral/70" />}
      <span className="font-medium min-w-[120px]">{prop.key}</span>
      <span className="text-ivory/30">:</span>
      <span className="flex-1 truncate text-ivory/50">{valueStr}</span>
      <span className="text-ivory/20">{prop.type}</span>
      {inherited && prop.origin && (
        <span className="text-coral/50 hidden group-hover:block">{prop.origin}</span>
      )}
    </button>
  )
}

interface PopoverProps {
  prop: ObjectProperty
  onClose: () => void
}

function PropPopover({ prop, onClose }: PopoverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-surface border border-coral/40 rounded-lg p-5 max-w-sm w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-coral" />
          <span className="text-coral font-mono font-medium text-sm">Inherited Property</span>
        </div>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex justify-between">
            <span className="text-ivory/40">Key</span>
            <span className="text-ivory">{prop.key}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ivory/40">Value</span>
            <span className="text-coral truncate max-w-[180px]">{String(prop.value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ivory/40">Origin</span>
            <span className="text-marigold">{prop.origin ?? '—'}</span>
          </div>
          {prop.introducedBy && (
            <div className="flex justify-between">
              <span className="text-ivory/40">Introduced by</span>
              <span className="text-iris">{prop.introducedBy}</span>
            </div>
          )}
          {prop.propagationCount !== undefined && (
            <div className="flex justify-between">
              <span className="text-ivory/40">Propagation count</span>
              <span className="text-ivory">{prop.propagationCount} objects</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-xs font-mono text-ivory/50 hover:text-ivory border border-border rounded hover:border-ivory/30 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

interface ObjectInspectorProps {
  state: ObjectState
}

export default function ObjectInspector({ state }: ObjectInspectorProps) {
  const [ownOpen, setOwnOpen] = useState(true)
  const [inheritedOpen, setInheritedOpen] = useState(true)
  const [selectedProp, setSelectedProp] = useState<ObjectProperty | null>(null)

  return (
    <>
      <div className={`rounded-md border overflow-hidden ${state.polluted ? 'border-coral/40' : 'border-border'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${state.polluted ? 'border-coral/40 bg-coral/5' : 'border-border bg-surface/60'}`}>
          <div className="flex items-center gap-2">
            {state.polluted && <AlertTriangle size={14} className="text-coral" />}
            <span className="font-mono text-sm text-ivory font-medium">{state.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {state.polluted && (
              <span className="text-xs font-mono text-coral border border-coral/30 px-2 py-0.5 rounded">POLLUTED</span>
            )}
            <span className="text-xs font-mono text-ivory/30">{state.prototypeChain.join(' → ')}</span>
          </div>
        </div>

        <div className="p-2 space-y-1">
          {/* Own properties */}
          <button
            onClick={() => setOwnOpen(o => !o)}
            className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-ivory/40 hover:text-ivory/70 w-full text-left"
          >
            {ownOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Own Properties ({state.ownProperties.length})
          </button>
          {ownOpen && state.ownProperties.map((p: ObjectProperty) => (
            <PropertyRow key={p.key} prop={p} />
          ))}

          {/* Inherited properties */}
          {state.inheritedProperties.length > 0 && (
            <>
              <button
                onClick={() => setInheritedOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-coral/60 hover:text-coral w-full text-left mt-2"
              >
                {inheritedOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Inherited from Object.prototype ({state.inheritedProperties.length})
                {state.polluted && <span className="ml-auto text-coral text-xs">← POLLUTED</span>}
              </button>
              {inheritedOpen && state.inheritedProperties.map((p: ObjectProperty) => (
                <PropertyRow
                  key={p.key}
                  prop={p}
                  inherited={!!p.origin}
                  onClick={setSelectedProp}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {selectedProp && (
        <PropPopover prop={selectedProp} onClose={() => setSelectedProp(null)} />
      )}
    </>
  )
}
