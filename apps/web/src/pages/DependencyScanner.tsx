import { useState, useCallback } from 'react'
import { AlertTriangle, Package, ShieldAlert, Info } from 'lucide-react'

interface GadgetHint {
  property: string
  gadgetId?: string
  note: string
}

interface PackageMatch {
  name: string
  version: string
  hints: GadgetHint[]
}

interface AnalysisResult {
  total: number
  matches: PackageMatch[]
  potentialSources: string[]
  error?: string
}

const GADGET_PACKAGES: Record<string, GadgetHint[]> = {
  axios: [
    { property: 'baseURL', gadgetId: 'GDG-AXIOS-001', note: 'mergeConfig() may inherit baseURL' },
    { property: 'method', gadgetId: 'GDG-AXIOS-002', note: 'config may inherit method' },
    {
      property: 'headers',
      gadgetId: 'GDG-AXIOS-003',
      note: 'headers object may inherit from prototype',
    },
  ],
  lodash: [
    {
      property: '__proto__',
      note: '_.merge() in versions <4.17.21 is a known pollution source',
    },
  ],
  qs: [
    {
      property: '__proto__',
      note: 'Query string parser with bracket notation may pollute prototype',
    },
  ],
  express: [
    { property: '__proto__', note: 'req.query uses qs — check qs version' },
  ],
  minimist: [
    { property: '__proto__', note: 'CLI arg parser known pollution source in <1.2.6' },
  ],
  'yargs-parser': [
    {
      property: '__proto__',
      note: 'yargs-parser <20.2.4 allows __proto__ in arg names',
    },
  ],
  'node-forge': [
    {
      property: 'prototype',
      note: 'TLS/cert validation may be bypassed via prototype pollution in <1.0.0',
    },
  ],
  handlebars: [
    { property: '__proto__', note: 'Template engine with known prototype pollution in <4.7.7' },
  ],
  jquery: [
    { property: '__proto__', note: '$.extend() deep merge is a classic pollution vector' },
  ],
}

const SOURCE_PACKAGES = new Set([
  'lodash', 'qs', 'minimist', 'yargs-parser', 'handlebars', 'jquery', 'express',
])

function analyzePackageJson(rawJson: string): AnalysisResult {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawJson) as Record<string, unknown>
  } catch {
    return { total: 0, matches: [], potentialSources: [], error: 'Invalid JSON — paste a valid package.json.' }
  }

  const deps: Record<string, string> = {
    ...((parsed['dependencies'] as Record<string, string>) ?? {}),
    ...((parsed['devDependencies'] as Record<string, string>) ?? {}),
    ...((parsed['peerDependencies'] as Record<string, string>) ?? {}),
  }

  const total = Object.keys(deps).length
  const matches: PackageMatch[] = []
  const potentialSources: string[] = []

  for (const [name, version] of Object.entries(deps)) {
    const hints = GADGET_PACKAGES[name]
    if (hints) {
      matches.push({ name, version, hints })
    }
    if (SOURCE_PACKAGES.has(name)) {
      potentialSources.push(name)
    }
  }

  return { total, matches, potentialSources }
}

const SAMPLE = `{
  "name": "my-app",
  "dependencies": {
    "axios": "^1.5.0",
    "express": "^4.18.2",
    "lodash": "^4.17.20",
    "qs": "^6.5.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}`

export default function DependencyScanner() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const analyze = useCallback(() => {
    if (!input.trim()) return
    setResult(analyzePackageJson(input))
  }, [input])

  const loadSample = useCallback(() => {
    setInput(SAMPLE)
    setResult(null)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Tools</div>
        <h1 className="text-2xl font-bold">Dependency Scanner</h1>
        <p className="text-ivory/50 text-sm mt-1">
          Analyze a local package.json for known gadget-relevant packages. Package presence is{' '}
          <strong className="text-ivory/70">NOT proof of exploitability.</strong>
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 border border-marigold/20 bg-marigold/5 rounded-md px-4 py-3">
        <Info size={14} className="text-marigold flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ivory/60 leading-relaxed">
          This scanner checks for packages that contain known prototype pollution sources or gadgets.
          A match means the package <em>may</em> be relevant — it does not confirm a vulnerability.
          Confirm reachability and exploit conditions in the BLEED lab before drawing any conclusions.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-ivory/50 uppercase tracking-widest">
            Paste package.json
          </label>
          <button
            onClick={loadSample}
            className="text-xs font-mono text-ivory/30 hover:text-ivory/60 transition-colors"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='{ "dependencies": { "axios": "^1.5.0" } }'
          rows={12}
          className="w-full bg-graphite border border-border rounded-md px-4 py-3 text-xs font-mono text-ivory placeholder-ivory/20 resize-y focus:outline-none focus:border-coral/40 focus:ring-1 focus:ring-coral/15"
          spellCheck={false}
        />
        <button
          onClick={analyze}
          disabled={!input.trim()}
          className="flex items-center gap-2 bg-coral text-graphite text-sm font-semibold px-5 py-2.5 rounded-sm hover:bg-coral/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Package size={14} /> Analyze
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {result.error ? (
            <div className="flex items-center gap-3 border border-coral/30 bg-coral/5 rounded-md px-4 py-3 text-sm text-coral font-mono">
              <AlertTriangle size={14} />
              {result.error}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-md p-4">
                  <div className="text-2xl font-mono font-bold text-ivory">{result.total}</div>
                  <div className="text-xs font-mono text-ivory/40 mt-1">Total packages</div>
                </div>
                <div className={`bg-surface border rounded-md p-4 ${result.matches.length > 0 ? 'border-marigold/30 bg-marigold/5' : 'border-border'}`}>
                  <div className={`text-2xl font-mono font-bold ${result.matches.length > 0 ? 'text-marigold' : 'text-ivory'}`}>
                    {result.matches.length}
                  </div>
                  <div className="text-xs font-mono text-ivory/40 mt-1">Gadget-relevant packages</div>
                </div>
                <div className={`bg-surface border rounded-md p-4 ${result.potentialSources.length > 0 ? 'border-coral/30 bg-coral/5' : 'border-border'}`}>
                  <div className={`text-2xl font-mono font-bold ${result.potentialSources.length > 0 ? 'text-coral' : 'text-ivory'}`}>
                    {result.potentialSources.length}
                  </div>
                  <div className="text-xs font-mono text-ivory/40 mt-1">Known pollution sources</div>
                </div>
              </div>

              {result.matches.length === 0 && (
                <div className="border border-border rounded-md p-8 text-center text-ivory/30 text-sm font-mono">
                  No known gadget-relevant packages found in this package.json.
                </div>
              )}

              {result.matches.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-mono text-ivory/30 uppercase tracking-widest">
                    Gadget-Relevant Packages
                  </h2>
                  {result.matches.map(m => (
                    <div
                      key={m.name}
                      className="bg-surface border border-marigold/20 rounded-md p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldAlert size={14} className="text-marigold flex-shrink-0" />
                        <span className="font-mono font-semibold text-ivory">{m.name}</span>
                        <span className="font-mono text-xs text-ivory/30">{m.version}</span>
                      </div>
                      <div className="space-y-2 pl-5">
                        {m.hints.map((h, i) => (
                          <div key={i} className="text-xs font-mono space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-coral">.{h.property}</span>
                              {h.gadgetId && (
                                <span className="text-iris bg-iris/10 border border-iris/20 px-1.5 py-0.5 rounded text-[10px]">
                                  {h.gadgetId}
                                </span>
                              )}
                            </div>
                            <div className="text-ivory/40">{h.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border border-border rounded px-4 py-3 text-xs font-mono text-ivory/20">
                These packages may contain prototype pollution sources or gadgets in certain versions.
                Confirm reachability in the lab before drawing any conclusions.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
