import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { StatusBadge, Badge } from '../components/common/Badge'
import { mockGadgets } from '../api/mockData'
import type { GadgetCategory, GadgetStatus } from '@bleed/shared'

const CATEGORIES: string[] = ['ALL', 'HTTP', 'AUTH', 'EXECUTION_SIM', 'FILE', 'CALLBACK', 'ROUTING']
const STATUSES: string[] = ['ALL', 'REPRODUCED', 'REACHABLE', 'POTENTIAL', 'BLOCKED', 'INCONCLUSIVE']

export default function Gadgets() {
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('ALL')
  const [status, setStatus] = useState('ALL')

  const filtered = mockGadgets.filter(g => {
    const matchSearch = search === '' ||
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.library.toLowerCase().includes(search.toLowerCase()) ||
      g.property.toLowerCase().includes(search.toLowerCase())
    const matchCat = cat === 'ALL' || g.category === cat
    const matchStatus = status === 'ALL' || g.status === status
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Inventory</div>
        <h1 className="text-2xl font-bold">Gadget Inventory</h1>
        <p className="text-ivory/50 text-sm mt-1">Library code paths that read inherited properties from Object.prototype.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search gadgets..."
            className="bg-surface border border-border rounded-sm pl-8 pr-3 py-2 text-sm text-ivory placeholder:text-ivory/30 outline-none focus:border-ivory/30 w-56"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs font-mono px-2.5 py-1.5 rounded border transition-colors ${cat === c ? 'border-iris/50 text-iris bg-iris/10' : 'border-border text-ivory/40 hover:border-ivory/20 hover:text-ivory/70'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">ID</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Library</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Property</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Category</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Impact</th>
              <th className="text-left px-4 py-3 text-xs font-mono text-ivory/40">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g, i) => (
              <tr
                key={g.id}
                onClick={() => nav(`/gadgets/${g.id}`)}
                className={`border-b border-border hover:bg-white/5 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-surface/20'}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-ivory/50">{g.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ivory">{g.library}</div>
                  {g.versionRange && <div className="text-xs font-mono text-ivory/30">{g.versionRange}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-coral">.{g.property}</td>
                <td className="px-4 py-3"><Badge label={g.category} variant="iris" /></td>
                <td className="px-4 py-3 text-xs text-ivory/50 font-mono">{g.impactClass.replace('SYNTHETIC_', '')}</td>
                <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ivory/30 text-sm font-mono">No gadgets match filters</div>
        )}
      </div>
    </div>
  )
}
