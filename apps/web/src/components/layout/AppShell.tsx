import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import CommandPalette from '../common/CommandPalette'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useKeyboardShortcuts()

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('bleed:cmd'))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-graphite">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      </div>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="fixed left-0 top-0 bottom-0 z-40 md:hidden">
          <Sidebar />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          onMenuClick={() => setMobileOpen(o => !o)}
          onSearchClick={openSearch}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette navigate={navigate} />
    </div>
  )
}
