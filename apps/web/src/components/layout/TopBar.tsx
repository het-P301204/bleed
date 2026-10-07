import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, RefreshCw, ChevronRight, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/app'
import NotificationBell from '../common/NotificationBell'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/lab': 'Lab',
  '/sources': 'Source Library',
  '/gadgets': 'Gadget Inventory',
  '/scanner': 'Dependency Scanner',
  '/chains': 'Chain Library',
  '/chains/new': 'Chain Builder',
  '/visualizer': 'Prototype Chain Visualizer',
  '/runs': 'Research Runs',
  '/evidence': 'Evidence',
  '/properties': 'Property Intelligence',
  '/compare': 'Chain Comparison',
  '/before-after': 'Before / After',
  '/inspector': 'Object Inspector',
  '/notebook': 'Research Notebook',
  '/methodology': 'Methodology',
  '/research': 'Research References',
  '/settings': 'Settings',
}

function relativeTime(ts: number | null) {
  if (!ts) return null
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 10) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function DemoPill() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { mode, setMode, addToast } = useAppStore()
  const nav = useNavigate()

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (mode !== 'DEMO') return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs font-mono text-marigold border border-marigold/40 bg-marigold/8 hover:bg-marigold/15 px-2.5 py-1 rounded transition-colors"
      >
        <Zap size={10} />
        DEMO DATA
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-graphite border border-border rounded-lg shadow-2xl z-50 p-4"
          >
            <div className="text-xs font-mono text-marigold uppercase tracking-widest mb-1">Demo Environment</div>
            <div className="text-sm text-ivory/70 mb-1">Synthetic research dataset</div>
            <div className="text-xs text-ivory/40 mb-4">No external systems are being analyzed. All data is controlled lab output.</div>
            <div className="flex gap-2">
              <button
                onClick={() => { setOpen(false); nav('/dashboard') }}
                className="flex-1 text-xs font-semibold bg-coral text-graphite px-3 py-2 rounded-sm hover:bg-coral/90 transition-colors"
              >
                Explore Demo
              </button>
              <button
                onClick={() => {
                  setMode('LIVE')
                  setOpen(false)
                  addToast({ type: 'info', title: 'Switched to Live Lab mode', description: 'Connect Docker lab to use real scenarios' })
                }}
                className="flex-1 text-xs font-semibold border border-border text-ivory/60 px-3 py-2 rounded-sm hover:border-ivory/30 hover:text-ivory transition-colors"
              >
                Launch Local Lab
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RefreshButton() {
  const { refreshState, lastRefreshed, refresh, addToast } = useAppStore()
  const [relTime, setRelTime] = useState(relativeTime(lastRefreshed))

  useEffect(() => {
    const t = setInterval(() => setRelTime(relativeTime(lastRefreshed)), 10000)
    return () => clearInterval(t)
  }, [lastRefreshed])

  async function handleRefresh() {
    if (refreshState === 'REFRESHING') return
    await refresh()
    addToast({ type: 'success', title: 'Research dataset refreshed', description: 'All metrics updated' })
  }

  const isRefreshing = refreshState === 'REFRESHING'
  const isUpdated = refreshState === 'UPDATED'

  return (
    <div className="flex items-center gap-1.5">
      {relTime && (
        <span className="text-xs font-mono text-ivory/25 hidden sm:block">
          {isRefreshing ? 'Refreshing...' : isUpdated ? 'Updated just now' : `Updated ${relTime}`}
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`p-1.5 rounded-sm border transition-colors ${
          isUpdated
            ? 'border-sage/30 text-sage'
            : 'border-transparent text-ivory/40 hover:text-ivory hover:border-border'
        }`}
        title="Refresh dataset"
      >
        <RefreshCw
          size={14}
          className={isRefreshing ? 'animate-spin' : ''}
        />
      </button>
    </div>
  )
}

interface TopBarProps {
  onMenuClick: () => void
  onSearchClick: () => void
}

export default function TopBar({ onMenuClick, onSearchClick }: TopBarProps) {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]!
  const title = titles[pathname] ?? titles[base] ?? 'BLEED'

  return (
    <header className="flex items-center gap-3 h-14 px-6 border-b border-border bg-surface/50 backdrop-blur-sm flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="text-ivory/40 hover:text-ivory transition-colors md:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-bold text-ivory text-base tracking-wide flex-1 truncate">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <DemoPill />
        <RefreshButton />
        <NotificationBell />
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 text-ivory/40 hover:text-ivory bg-border/50 hover:bg-border px-3 py-1.5 rounded-sm text-sm transition-colors"
        >
          <Search size={14} />
          <span className="hidden sm:block font-mono text-xs">Search...</span>
          <kbd className="hidden sm:block font-mono text-xs text-ivory/30 border border-border px-1 rounded">⌘K</kbd>
        </button>
      </div>
    </header>
  )
}
