import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, BookOpen, Cpu, Link2, Play,
  Eye, FileSearch, BookOpenCheck, Microscope, Settings, StickyNote,
  PackageSearch, Database, Fingerprint, GitCompare, ArrowLeftRight,
} from 'lucide-react'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lab', label: 'Lab', icon: FlaskConical },
  { to: '/sources', label: 'Sources', icon: BookOpen },
  { to: '/gadgets', label: 'Gadgets', icon: Cpu },
  { to: '/scanner', label: 'Scanner', icon: PackageSearch },
  { to: '/chains', label: 'Chains', icon: Link2 },
  { to: '/runs', label: 'Runs', icon: Play },
  { to: '/visualizer', label: 'Visualizer', icon: Eye },
  { to: '/evidence', label: 'Evidence', icon: FileSearch },
  { to: '/properties', label: 'Properties', icon: Fingerprint },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/before-after', label: 'Before/After', icon: ArrowLeftRight },
  { to: '/notebook', label: 'Notebook', icon: StickyNote },
  { to: '/methodology', label: 'Methodology', icon: BookOpenCheck },
  { to: '/research', label: 'Research', icon: Database },
  { to: '/inspector', label: 'Object Inspector', icon: Microscope },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full bg-surface border-r border-border transition-all duration-300"
      style={{ width: collapsed ? 60 : 220 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-sm bg-coral flex items-center justify-center flex-shrink-0">
          <span className="font-mono font-bold text-graphite text-xs">B</span>
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-ivory text-sm tracking-widest">BLEED</div>
            <div className="text-xs text-ivory/40 font-mono">v0.1.0</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-coral bg-coral/10 border-r-2 border-coral'
                  : 'text-ivory/60 hover:text-ivory hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span className="font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              isActive ? 'text-coral' : 'text-ivory/40 hover:text-ivory'
            }`
          }
        >
          <Settings size={16} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        {!collapsed && (
          <div className="px-4 pb-4 pt-1">
            <kbd className="text-xs font-mono text-ivory/30 bg-border px-1.5 py-0.5 rounded">⌘K</kbd>
            <span className="text-xs text-ivory/30 ml-1">Command palette</span>
          </div>
        )}
      </div>
    </aside>
  )
}
