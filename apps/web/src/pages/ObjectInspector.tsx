import { useState } from 'react'
import ObjectInspector from '../components/common/ObjectInspector'
import { mockObjectStates } from '../api/mockData'
import type { ObjectState } from '@bleed/shared'

const customState: ObjectState = {
  id: 'OBJ-CUSTOM',
  timestamp: Date.now(),
  label: 'Custom Object {}',
  ownProperties: [
    { key: 'name', value: 'example', type: 'string', own: true },
    { key: 'count', value: 42, type: 'number', own: true },
  ],
  inheritedProperties: [
    { key: 'toString', value: '[Function: toString]', type: 'function', own: false, origin: 'Object.prototype' },
    { key: 'hasOwnProperty', value: '[Function]', type: 'function', own: false, origin: 'Object.prototype' },
  ],
  prototypeChain: ['Object', 'Object.prototype', 'null'],
  polluted: false,
}

export default function ObjectInspectorPage() {
  const [selected, setSelected] = useState<'before' | 'after' | 'custom'>('before')

  const stateMap = {
    before: mockObjectStates[0]!,
    after: mockObjectStates[1]!,
    custom: customState,
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Tool</div>
        <h1 className="text-2xl font-bold">Object Inspector</h1>
        <p className="text-ivory/50 text-sm mt-1">
          Inspect JavaScript object state — own vs inherited properties. Inherited properties highlighted in coral when polluted.
          Click an inherited property to see its origin, source, and propagation count.
        </p>
      </div>

      {/* Selector */}
      <div className="flex gap-2">
        {(['before', 'after', 'custom'] as const).map(k => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
              selected === k ? 'border-coral text-coral bg-coral/5' : 'border-border text-ivory/40 hover:border-ivory/20'
            }`}
          >
            {k === 'before' ? 'Clean Object' : k === 'after' ? 'Polluted Object' : 'Custom'}
          </button>
        ))}
      </div>

      <ObjectInspector state={stateMap[selected]} />

      {/* Explanation */}
      <div className="bg-surface border border-border rounded-md p-5 text-sm text-ivory/60 space-y-2">
        <h3 className="font-semibold text-ivory text-sm mb-2">Reading the Inspector</h3>
        <p><strong className="text-ivory">Own properties</strong> are defined directly on the object — they appear as the object's own data.</p>
        <p><strong className="text-coral">Inherited properties</strong> come from the prototype chain. Clicking one reveals its origin (usually Object.prototype), the source that introduced it, and how many objects now inherit it.</p>
        <p>When <code className="font-mono text-coral/80 text-xs bg-coral/5 px-1 rounded">POLLUTED</code> shows in the header, a pollution source has written a new property to Object.prototype that affects this object.</p>
      </div>

      {/* Side by side comparison */}
      <div>
        <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Before / After Comparison</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono text-ivory/40 mb-2">CLEAN</div>
            <ObjectInspector state={mockObjectStates[0]!} />
          </div>
          <div>
            <div className="text-xs font-mono text-coral/60 mb-2">POLLUTED</div>
            <ObjectInspector state={mockObjectStates[1]!} />
          </div>
        </div>
      </div>
    </div>
  )
}
