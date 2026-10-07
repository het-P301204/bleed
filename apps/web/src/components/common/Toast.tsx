import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useAppStore } from '../../store/app'
import type { Toast } from '../../store/app'

const ICON_CONFIG = {
  success: { Icon: CheckCircle2, className: 'text-sage' },
  error:   { Icon: XCircle,      className: 'text-coral' },
  info:    { Icon: Info,         className: 'text-iris' },
  warning: { Icon: AlertTriangle, className: 'text-marigold' },
} as const

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useAppStore(s => s.removeToast)
  const duration = toast.duration ?? 3500
  const { Icon, className } = ICON_CONFIG[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, duration, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-start gap-3 bg-surface border border-border rounded-sm px-4 py-3 shadow-lg min-w-[300px] max-w-[400px]"
    >
      <Icon size={18} className={`${className} mt-0.5 flex-shrink-0`} />

      <div className="flex-1 min-w-0">
        <p className="text-ivory text-sm font-medium leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-ivory/50 text-xs mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        className="text-ivory/30 hover:text-ivory/70 transition-colors flex-shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function ToastProvider() {
  const toasts = useAppStore(s => s.toasts)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
