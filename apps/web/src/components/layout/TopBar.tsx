import { useLocation } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/lab': 'Lab',
  '/sources': 'Source Library',
  '/gadgets': 'Gadget Inventory',
  '/chains': 'Chain Library',
  '/chains/new': 'Chain Builder',
  '/visualizer': 'Prototype Chain Visualizer',
  '/runs': 'Research Runs',
  '/evidence': 'Evidence',
  '/inspector': 'Object Inspector',
  '/methodology': 'Methodology',
  '/research': 'Research References',
  '/settings': 'Settings',
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
    <header className="flex items-center gap-4 h-14 px-6 border-b border-border bg-surface/50 backdrop-blur-sm flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="text-ivory/40 hover:text-ivory transition-colors md:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-bold text-ivory text-base tracking-wide flex-1">{title}</h1>

      <button
        onClick={onSearchClick}
        className="flex items-center gap-2 text-ivory/40 hover:text-ivory bg-border/50 hover:bg-border px-3 py-1.5 rounded-sm text-sm transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:block font-mono text-xs">Search...</span>
        <kbd className="hidden sm:block font-mono text-xs text-ivory/30 border border-border px-1 rounded">⌘K</kbd>
      </button>
    </header>
  )
}
