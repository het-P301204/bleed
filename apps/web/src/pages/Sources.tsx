import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Search } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import { mockSources } from '../api/mockData'
import type { PollutionSource } from '@bleed/shared'

const categories = ['ALL', 'UNSAFE_MERGE', 'RECURSIVE_MERGE', 'DEEP_PARSER', 'PROPERTY_ASSIGN', 'CONFIG_MERGE', 'QUERY_NORMALIZE']

export default function Sources() {
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('ALL')

  const filtered = mockSources.filter(s => {
    const matchesSearch = search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.property.toLowerCase().includes(search.toLowerCase())
    const matchesCat = cat === 'ALL' || s.category === cat
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Library</div>
        <h1 className="text-2xl font-bold">Pollution Sources</h1>
        <p className="text-ivory/50 text-sm mt-1">Application code paths that enable prototype pollution through unsafe object merging.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sources..."
            className="bg-surface border border-border rounded-sm pl-8 pr-3 py-2 text-sm text-ivory placeholder:text-ivory/30 outline-none focus:border-ivory/30 w-56"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
                cat === c ? 'border-ivory/40 text-ivory bg-white/5' : 'border-border text-ivory/40 hover:border-ivory/20 hover:text-ivory/70'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(src => <SourceCard key={src.id} source={src} onNavigate={() => nav(`/sources/${src.id}`)} onRun={() => nav('/chains/new')} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-ivory/30 text-sm font-mono">No sources match filters</div>
      )}
    </div>
  )
}

function SourceCard({ source, onNavigate, onRun }: { source: PollutionSource; onNavigate: () => void; onRun: () => void }) {
  return (
    <div className="bg-surface border border-border hover:border-ivory/20 rounded-md p-5 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-ivory/30">{source.id}</span>
          <Badge label={source.category} variant="plum" />
          <StatusBadge status={source.status} />
        </div>
      </div>

      <button onClick={onNavigate} className="text-left w-full">
        <h3 className="font-semibold text-ivory mb-1">{source.name}</h3>
        <p className="text-xs text-ivory/50 leading-snug mb-3">{source.description.slice(0, 120)}...</p>
      </button>

      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex-1">
          <span className="text-ivory/30">Property: </span>
          <span className="text-coral">.{source.property}</span>
        </div>
        <div>
          <span className="text-ivory/30">File: </span>
          <span className="text-ivory/50">{source.file.split('/').pop()}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onNavigate}
          className="text-xs font-mono text-ivory/50 hover:text-ivory border border-border hover:border-ivory/30 px-3 py-1.5 rounded transition-colors"
        >
          View Detail
        </button>
        <button
          onClick={onRun}
          className="text-xs font-mono text-coral/70 hover:text-coral border border-coral/20 hover:border-coral/40 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
        >
          <Play size={10} /> Run Scenario
        </button>
      </div>
    </div>
  )
}
