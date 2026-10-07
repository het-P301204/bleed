import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SHORTCUT_MAP: Record<string, string> = {
  d: '/dashboard',
  l: '/lab',
  g: '/gadgets',
  c: '/chains',
  e: '/evidence',
  r: '/runs',
  v: '/visualizer',
  s: '/sources',
  p: '/properties',
}

export function useKeyboardShortcuts() {
  const nav = useNavigate()

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const route = SHORTCUT_MAP[event.key]
      if (route) {
        event.preventDefault()
        nav(route)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nav])
}
