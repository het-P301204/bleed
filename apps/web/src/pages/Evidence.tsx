import { useState } from 'react'
import { Search } from 'lucide-react'
import { StatusBadge } from '../components/common/Badge'
import { mockEvidence } from '../api/mockData'
import { FileCode, Clock } from 'lucide-react'

export default function Evidence() {
  const [search, setSearch] = useState('')

  const filtered = mockEvidence.filter(ev =>
    search === '' ||
    ev.description.toLowerCase().includes(search.toLowerCase()) ||
    ev.property.toLowerCase().includes(search.toLowerCase()) ||
    ev.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Database</div>
        <h1 className="text-2xl font-bold">Evidence</h1>
        <p className="text-ivory/50 text-sm mt-1">Runtime evidence collected from controlled research runs.</p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search evidence..."
          className="bg-surface border border-border rounded-sm pl-8 pr-3 py-2 text-sm text-ivory placeholder:text-ivory/30 outline-none focus:border-ivory/30 w-72"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(ev => (
          <div key={ev.id} className="bg-surface border border-border rounded-md p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-ivory/30">{ev.id}</span>
              {ev.runtimeEvent && <StatusBadge status={ev.runtimeEvent} />}
              <span className="font-mono text-xs text-coral">.{ev.property}</span>
              <span className="text-xs text-ivory/30 font-mono">from {ev.origin}</span>
            </div>
            <p className="text-sm text-ivory/80 leading-snug">{ev.description}</p>
            {ev.sourceFile && (
              <div className="flex items-center gap-2 text-xs font-mono text-ivory/30">
                <FileCode size={12} />
                <span>{ev.sourceFile}{ev.sourceLine ? `:${ev.sourceLine}` : ''}</span>
              </div>
            )}
            {ev.impact && (
              <div className="text-xs font-mono text-coral/60 border border-coral/20 px-2 py-0.5 rounded bg-coral/5 inline-block">
                CONTROLLED LAB IMPACT — {ev.impact}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs font-mono text-ivory/20">
              <Clock size={10} />
              <span>{new Date(ev.timestamp).toLocaleString()}</span>
              <span className="ml-2">fixture v{ev.fixtureVersion}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ivory/30 text-sm font-mono">No evidence matches search</div>
        )}
      </div>
    </div>
  )
}
