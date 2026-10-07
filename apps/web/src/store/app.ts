import { create } from 'zustand'

type RefreshState = 'CURRENT' | 'REFRESHING' | 'UPDATED' | 'STALE' | 'FAILED'
type AppMode = 'DEMO' | 'LIVE'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
}

export interface Notification {
  id: string
  read: boolean
  type: 'run_completed' | 'chain_blocked' | 'evidence_captured' | 'dataset_refreshed' | 'scenario_failed'
  title: string
  description: string
  entityId?: string
  route?: string
  timestamp: number
}

export interface AppStore {
  mode: AppMode
  refreshState: RefreshState
  lastRefreshed: number | null
  toasts: Toast[]
  notifications: Notification[]
  bookmarks: { entityId: string; entityType: string; label: string }[]
  setMode: (m: AppMode) => void
  refresh: () => Promise<void>
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void
  markNotificationRead: (id: string) => void
  toggleBookmark: (entityId: string, entityType: string, label: string) => void
  isBookmarked: (entityId: string) => boolean
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export const useAppStore = create<AppStore>((set, get) => ({
  mode: 'DEMO',
  refreshState: 'CURRENT',
  lastRefreshed: null,
  toasts: [],
  notifications: [],
  bookmarks: [],

  setMode: (m) => set({ mode: m }),

  refresh: async () => {
    set({ refreshState: 'REFRESHING' })
    await new Promise<void>(resolve => setTimeout(resolve, 1200))
    set({ refreshState: 'UPDATED', lastRefreshed: Date.now() })
    setTimeout(() => {
      set({ refreshState: 'CURRENT' })
    }, 3000)
  },

  addToast: (t) => {
    const id = generateId()
    set(state => ({ toasts: [...state.toasts, { ...t, id }] }))
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },

  addNotification: (n) => {
    const id = generateId()
    set(state => ({
      notifications: [{ ...n, id, read: false }, ...state.notifications],
    }))
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  toggleBookmark: (entityId, entityType, label) => {
    set(state => {
      const exists = state.bookmarks.some(b => b.entityId === entityId)
      if (exists) {
        return { bookmarks: state.bookmarks.filter(b => b.entityId !== entityId) }
      }
      return { bookmarks: [...state.bookmarks, { entityId, entityType, label }] }
    })
  },

  isBookmarked: (entityId) => {
    return get().bookmarks.some(b => b.entityId === entityId)
  },
}))
