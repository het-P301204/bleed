import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Trash2 } from 'lucide-react'
import type { NoteEntry } from '../components/common/ResearchNote'

const ENTITY_TYPES = ['source', 'gadget', 'chain', 'run'] as const
type EntityFilter = 'all' | (typeof ENTITY_TYPES)[number]

const BADGE_COLORS: Record<string, string> = {
  source: 'bg-plum/30 text-ivory/70 border-plum/40',
  gadget: 'bg-iris/15 text-iris border-iris/30',
  chain: 'bg-coral/15 text-coral border-coral/30',
  run: 'bg-marigold/15 text-marigold border-marigold/30',
}

function loadAllNotes(): NoteEntry[] {
  const all: NoteEntry[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('bleed-notes-')) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as NoteEntry[]
      all.push(...parsed)
    }
  } catch {
    /* storage unavailable */
  }
  return all.sort((a, b) => b.timestamp - a.timestamp)
}

function deleteNoteFromStorage(note: NoteEntry) {
  try {
    const key = `bleed-notes-${note.entityType}-${note.entityId}`
    const raw = localStorage.getItem(key)
    if (!raw) return
    const notes = (JSON.parse(raw) as NoteEntry[]).filter(n => n.id !== note.id)
    localStorage.setItem(key, JSON.stringify(notes))
  } catch {
    /* storage unavailable */
  }
}

const fmt = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function Notebook() {
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [filter, setFilter] = useState<EntityFilter>('all')

  const refresh = useCallback(() => setNotes(loadAllNotes()), [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    (note: NoteEntry) => {
      deleteNoteFromStorage(note)
      refresh()
    },
    [refresh],
  )

  const visible = filter === 'all' ? notes : notes.filter(n => n.entityType === filter)

  const counts: Record<string, number> = { all: notes.length }
  for (const t of ENTITY_TYPES) {
    counts[t] = notes.filter(n => n.entityType === t).length
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Research</div>
        <h1 className="text-2xl font-bold">Notebook</h1>
        <p className="text-ivory/50 text-sm mt-1">
          All research annotations across sources, gadgets, chains, and runs.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', ...ENTITY_TYPES] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
              filter === type
                ? 'bg-coral/15 text-coral border-coral/30'
                : 'text-ivory/40 border-border hover:text-ivory/70 hover:border-ivory/20'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            {counts[type] !== undefined && counts[type] > 0 && (
              <span className="ml-1.5 opacity-60">({counts[type]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="border border-border rounded-lg p-12 text-center space-y-3">
          <StickyNote size={32} className="mx-auto text-ivory/20" />
          <div className="text-sm text-ivory/30">
            {notes.length === 0
              ? 'No research notes yet. Add notes from any Source, Gadget, Chain, or Run.'
              : `No ${filter} notes found.`}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-3">
        {visible.map(note => (
          <div
            key={note.id}
            className="bg-surface border border-border rounded-md p-4 space-y-2 hover:border-ivory/15 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded border ${BADGE_COLORS[note.entityType] ?? 'bg-ivory/10 text-ivory/50 border-ivory/20'}`}
                >
                  {note.entityType}
                </span>
                <span className="text-xs font-mono text-ivory/50">{note.entityLabel}</span>
              </div>
              <button
                onClick={() => remove(note)}
                className="flex-shrink-0 text-ivory/20 hover:text-coral/60 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <p className="text-sm font-mono text-ivory/80 leading-relaxed whitespace-pre-wrap border-l-2 border-coral/30 pl-3">
              {note.content}
            </p>
            <div className="text-[10px] font-sans text-ivory/25">{fmt(note.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
