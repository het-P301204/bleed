import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Trash2, Plus, X, Save } from 'lucide-react'

interface NoteEntry {
  id: string
  content: string
  timestamp: number
  entityId: string
  entityLabel: string
  entityType: 'source' | 'gadget' | 'chain' | 'run'
}

interface Props {
  entityId: string
  entityType: 'source' | 'gadget' | 'chain' | 'run'
  entityLabel: string
}

function storageKey(type: string, id: string) {
  return `bleed-notes-${type}-${id}`
}

function loadNotes(type: string, id: string): NoteEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(type, id))
    return raw ? (JSON.parse(raw) as NoteEntry[]) : []
  } catch {
    return []
  }
}

function saveNotes(type: string, id: string, notes: NoteEntry[]) {
  try {
    localStorage.setItem(storageKey(type, id), JSON.stringify(notes))
  } catch {
    /* storage unavailable */
  }
}

export default function ResearchNote({ entityId, entityType, entityLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setNotes(loadNotes(entityType, entityId))
  }, [entityType, entityId])

  const add = useCallback(() => {
    if (!draft.trim()) return
    const note: NoteEntry = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content: draft.trim(),
      timestamp: Date.now(),
      entityId,
      entityLabel,
      entityType,
    }
    const updated = [...notes, note]
    setNotes(updated)
    saveNotes(entityType, entityId, updated)
    setDraft('')
    setAdding(false)
  }, [draft, notes, entityId, entityLabel, entityType])

  const remove = useCallback(
    (id: string) => {
      const updated = notes.filter(n => n.id !== id)
      setNotes(updated)
      saveNotes(entityType, entityId, updated)
    },
    [notes, entityType, entityId],
  )

  const fmt = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-xs font-mono text-ivory/40 hover:text-ivory/70 transition-colors border border-border rounded px-3 py-1.5 hover:border-ivory/20"
        >
          <StickyNote size={12} />
          <span>
            {notes.length > 0 ? `${notes.length} Note${notes.length > 1 ? 's' : ''}` : 'Add Note'}
          </span>
        </button>
        {open && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs font-mono text-coral/70 hover:text-coral transition-colors"
          >
            <Plus size={12} /> New
          </button>
        )}
      </div>

      {open && (
        <div className="bg-surface/60 border border-border rounded-md p-4 space-y-3">
          {adding && (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Research observation, hypothesis, or annotation…"
                rows={3}
                autoFocus
                className="w-full bg-graphite border border-border rounded px-3 py-2 text-xs font-mono text-ivory placeholder-ivory/20 resize-y focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={add}
                  disabled={!draft.trim()}
                  className="flex items-center gap-1.5 text-xs font-mono bg-coral text-graphite px-3 py-1.5 rounded hover:bg-coral/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={11} /> Save
                </button>
                <button
                  onClick={() => { setAdding(false); setDraft('') }}
                  className="flex items-center gap-1.5 text-xs font-mono text-ivory/40 hover:text-ivory px-2 py-1.5 transition-colors"
                >
                  <X size={11} /> Cancel
                </button>
              </div>
            </div>
          )}

          {notes.length === 0 && !adding && (
            <p className="text-xs font-mono text-ivory/25 italic">
              No notes yet. Click New to add a research observation.
            </p>
          )}

          {notes.map(note => (
            <div
              key={note.id}
              className="border-l-2 border-coral/40 pl-3 py-1 space-y-1"
            >
              <p className="text-xs font-mono text-ivory/80 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans text-ivory/30">{fmt(note.timestamp)}</span>
                <button
                  onClick={() => remove(note.id)}
                  className="text-ivory/20 hover:text-coral/60 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { loadNotes }
export type { NoteEntry }
