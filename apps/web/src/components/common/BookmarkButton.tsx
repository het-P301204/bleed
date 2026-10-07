import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/app'

interface Props {
  entityId: string
  entityType: string
  label: string
  size?: number
}

export default function BookmarkButton({ entityId, entityType, label, size = 16 }: Props) {
  const toggleBookmark = useAppStore(s => s.toggleBookmark)
  const isBookmarked = useAppStore(s => s.isBookmarked(entityId))
  const addToast = useAppStore(s => s.addToast)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    toggleBookmark(entityId, entityType, label)
    addToast({
      type: 'success',
      title: isBookmarked ? 'Removed from Research Library' : 'Saved to Research Library',
      description: label,
      duration: 2000,
    })
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      title={isBookmarked ? 'Remove from library' : 'Save to library'}
      className="p-1.5 rounded transition-colors hover:bg-surface"
    >
      <Star
        size={size}
        className={`transition-colors ${isBookmarked ? 'text-marigold fill-marigold' : 'text-ivory/30 hover:text-ivory/60'}`}
      />
    </motion.button>
  )
}
