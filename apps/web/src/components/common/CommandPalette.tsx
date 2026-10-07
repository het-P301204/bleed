import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'

const commands = [
  { id: 'dashboard', label: 'Open Dashboard', path: '/dashboard', group: 'Navigation' },
  { id: 'lab', label: 'Open Lab', path: '/lab', group: 'Navigation' },
  { id: 'sources', label: 'Browse Sources', path: '/sources', group: 'Navigation' },
  { id: 'gadgets', label: 'Browse Gadgets', path: '/gadgets', group: 'Navigation' },
  { id: 'chains', label: 'View Chain Library', path: '/chains', group: 'Navigation' },
  { id: 'chains-new', label: 'Build New Chain', path: '/chains/new', group: 'Actions' },
  { id: 'runs', label: 'View Research Runs', path: '/runs', group: 'Navigation' },
  { id: 'visualizer', label: 'Open Prototype Chain Visualizer', path: '/visualizer', group: 'Navigation' },
  { id: 'evidence', label: 'Browse Evidence', path: '/evidence', group: 'Navigation' },
  { id: 'inspector', label: 'Inspect Object Prototype Chain', path: '/inspector', group: 'Tools' },
  { id: 'methodology', label: 'Read Methodology', path: '/methodology', group: 'Reference' },
  { id: 'research', label: 'Research References', path: '/research', group: 'Reference' },
  { id: 'settings', label: 'Settings', path: '/settings', group: 'Navigation' },
]

interface Props {
  navigate: (path: string) => void
}

export default function CommandPalette({ navigate }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('bleed:cmd', () => setOpen(true))
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('bleed:cmd', () => setOpen(true))
    }
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelected(0)
    }
  }, [open])

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  const run = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      const cmd = filtered[selected]
      if (cmd) run(cmd.path)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={16} className="text-ivory/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0) }}
                  onKeyDown={handleKey}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent text-ivory text-sm outline-none placeholder:text-ivory/30 font-mono"
                />
                <button onClick={() => setOpen(false)} className="text-ivory/30 hover:text-ivory">
                  <X size={14} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-ivory/30 text-sm">No results</div>
                ) : (
                  (() => {
                    let lastGroup = ''
                    return filtered.map((cmd, i) => {
                      const showGroup = cmd.group !== lastGroup
                      lastGroup = cmd.group
                      return (
                        <div key={cmd.id}>
                          {showGroup && (
                            <div className="px-4 py-1.5 text-xs font-mono text-ivory/30 uppercase tracking-wider">
                              {cmd.group}
                            </div>
                          )}
                          <button
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                              i === selected ? 'bg-coral/10 text-ivory' : 'text-ivory/70 hover:bg-white/5 hover:text-ivory'
                            }`}
                            onClick={() => run(cmd.path)}
                            onMouseEnter={() => setSelected(i)}
                          >
                            <ArrowRight size={12} className="flex-shrink-0 text-ivory/30" />
                            {cmd.label}
                          </button>
                        </div>
                      )
                    })
                  })()
                )}
              </div>

              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-ivory/30 font-mono">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>esc close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
