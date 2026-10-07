import { useState } from 'react'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState('http://localhost:4001')
  const [theme, setTheme] = useState('dark')
  const [autoReplay, setAutoReplay] = useState(true)

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Configuration</div>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* API */}
      <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-ivory">API Configuration</h2>
        <div>
          <label className="text-xs font-mono text-ivory/40 block mb-1.5">API Endpoint</label>
          <input
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            className="bg-graphite border border-border rounded-sm px-3 py-2 text-sm font-mono text-ivory outline-none focus:border-ivory/30 w-full"
          />
          <p className="text-xs text-ivory/30 mt-1">The BLEED API server. Change if running on a non-default port.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-sage rounded-full" />
          <span className="text-xs font-mono text-ivory/40">Connected (using mock data)</span>
        </div>
      </section>

      {/* Lab */}
      <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-ivory">Lab</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-ivory">Auto-replay on run open</div>
            <div className="text-xs text-ivory/40 font-mono">Automatically start replaying events when opening a run detail</div>
          </div>
          <button
            onClick={() => setAutoReplay(v => !v)}
            className={`w-10 h-5 rounded-full transition-colors relative ${autoReplay ? 'bg-sage' : 'bg-border'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-ivory rounded-full transition-all ${autoReplay ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </section>

      {/* Display */}
      <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-ivory">Display</h2>
        <div>
          <label className="text-xs font-mono text-ivory/40 block mb-2">Theme</label>
          <div className="flex gap-2">
            {['dark', 'light'].map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`text-xs font-mono px-4 py-2 rounded border transition-colors ${
                  theme === t ? 'border-ivory/40 text-ivory bg-white/5' : 'border-border text-ivory/40 hover:border-ivory/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-ivory/25 mt-1">Light mode coming soon.</p>
        </div>
      </section>

      {/* About */}
      <section className="bg-surface border border-border rounded-lg p-5 space-y-2 text-xs font-mono text-ivory/30">
        <div className="font-semibold text-ivory/50 mb-2">About BLEED</div>
        <div>Version: 0.1.0</div>
        <div>Stack: React 18 + TypeScript + Vite + Tailwind</div>
        <div>API: FastAPI (lab) + React Flow (visualizer)</div>
        <div className="pt-2 border-t border-border text-ivory/20">
          All research impacts are CONTROLLED LAB IMPACT — synthetic data only.
        </div>
      </section>
    </div>
  )
}
