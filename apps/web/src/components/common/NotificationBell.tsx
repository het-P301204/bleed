import { useState } from 'react'
import { Bell, BellDot, Play, Shield, FileSearch, RefreshCw, AlertCircle, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  read: boolean
  type: 'run_completed' | 'chain_blocked' | 'evidence_captured' | 'dataset_refreshed' | 'scenario_failed'
  title: string
  description: string
  entityId?: string
  route?: string
  timestamp: number
}

const TYPE_ICONS = {
  run_completed: <Play size={12} className="text-coral" />,
  chain_blocked: <Shield size={12} className="text-sage" />,
  evidence_captured: <FileSearch size={12} className="text-iris" />,
  dataset_refreshed: <RefreshCw size={12} className="text-marigold" />,
  scenario_failed: <AlertCircle size={12} className="text-coral" />,
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', read: false, type: 'run_completed', title: 'Run RUN-2026-030 completed', description: 'Scenario SCN-001 reproduced — SYNTHETIC_SSRF confirmed', route: '/runs', timestamp: Date.now() - 3 * 60000 },
  { id: 'n2', read: false, type: 'chain_blocked', title: 'Chain CHN-002 blocked', description: 'Hardened fixture rejected __proto__.role pollution', route: '/chains/CHN-002', timestamp: Date.now() - 18 * 60000 },
  { id: 'n3', read: true, type: 'evidence_captured', title: 'Evidence EV-047 captured', description: 'Prototype pollution confirmed via runtime snapshot', route: '/evidence', timestamp: Date.now() - 45 * 60000 },
  { id: 'n4', read: true, type: 'dataset_refreshed', title: 'Dataset refreshed', description: 'All 20 sources and 36 gadgets re-indexed', route: '/dashboard', timestamp: Date.now() - 2 * 3600000 },
]

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const nav = useNavigate()

  const unread = notifications.filter(n => !n.read).length

  function markRead(id: string) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))
  }

  function handleClick(n: Notification) {
    markRead(n.id)
    if (n.route) nav(n.route)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-sm hover:bg-surface border border-transparent hover:border-border transition-colors"
        aria-label="Notifications"
      >
        {unread > 0 ? <BellDot size={16} className="text-ivory/70" /> : <Bell size={16} className="text-ivory/40" />}
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-graphite border border-border rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="text-xs font-mono text-ivory/40 uppercase tracking-widest">Notifications</div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-ivory/40 hover:text-ivory transition-colors">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}>
                    <X size={14} className="text-ivory/30 hover:text-ivory transition-colors" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-ivory/30 font-mono">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-border/60 hover:bg-surface/60 transition-colors flex items-start gap-3 ${!n.read ? 'bg-surface/30' : ''}`}
                    >
                      <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-border flex items-center justify-center">
                        {TYPE_ICONS[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium truncate ${!n.read ? 'text-ivory' : 'text-ivory/60'}`}>{n.title}</div>
                        <div className="text-xs text-ivory/40 mt-0.5 line-clamp-1">{n.description}</div>
                        <div className="text-xs font-mono text-ivory/25 mt-1">{relativeTime(n.timestamp)}</div>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-border">
                <button
                  onClick={() => { setOpen(false); nav('/runs') }}
                  className="flex items-center gap-1 text-xs text-ivory/30 hover:text-ivory transition-colors font-mono"
                >
                  View all activity <ChevronRight size={10} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
