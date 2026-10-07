import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { ResearchReference } from '@bleed/shared'

const FALLBACK_REFS: ResearchReference[] = [
  {
    id: 'REF-001',
    title: 'Server-Side Prototype Pollution: Black Box Detection Without the DoS',
    library: 'node-core',
    property: '__proto__',
    affectedVersions: 'all',
    impactClass: 'SYNTHETIC_SSRF',
    source: 'PortSwigger Research',
    date: '2022-01-01',
    summary:
      'Introduces techniques for detecting server-side prototype pollution without causing DoS. Demonstrates gadgets in Express and lodash ecosystems.',
    relatedGadgetIds: ['GDG-AXIOS-001', 'GDG-AUTH-001'],
    relatedScenarioIds: ['scn-baseurl', 'scn-role'],
    reproduced: true,
    notes: 'Foundation research for the BLEED lab methodology',
  },
  {
    id: 'REF-002',
    title: 'A Deep Dive into Prototype Pollution Attacks',
    library: 'lodash',
    property: '__proto__',
    affectedVersions: '<4.17.11',
    impactClass: 'SYNTHETIC_HTTP_MANIPULATION',
    source: 'Snyk Security Research',
    date: '2019-02-12',
    summary:
      'Analysis of CVE-2018-3721 and CVE-2019-10744 in lodash. Demonstrates how _.merge enables prototype pollution in vulnerable versions.',
    relatedGadgetIds: ['GDG-AXIOS-002'],
    relatedScenarioIds: ['scn-method'],
    reproduced: false,
    notes:
      'Lodash is not included in BLEED lab fixtures but the pattern mirrors src-recursive-merge',
  },
  {
    id: 'REF-003',
    title: 'Exploiting Prototype Pollution — RCE in Kibana via SSRF',
    library: 'node-core',
    property: 'env',
    affectedVersions: 'Kibana <7.6.3',
    impactClass: 'SYNTHETIC_EXECUTION_MARKER',
    source: 'Research: Michał Bentkowski',
    cve: 'CVE-2019-7609',
    date: '2019-05-15',
    summary:
      'Demonstrates a chain from prototype pollution source through process.env gadget to RCE. Kibana-specific but the pattern generalizes.',
    relatedGadgetIds: ['GDG-CB-001'],
    relatedScenarioIds: ['scn-visitor'],
    reproduced: false,
    notes: 'BLEED execution-sim scenario is inspired by this gadget class',
  },
  {
    id: 'REF-004',
    title: 'Silent Spring: Prototype Pollution Leads to RCE in Node.js',
    library: 'node-core',
    property: 'argv',
    affectedVersions: 'Node.js 14–18',
    impactClass: 'SYNTHETIC_EXECUTION_MARKER',
    source: 'Research: Yonatan Goldschmidt, Nili Sofer',
    date: '2022-10-24',
    summary:
      'Systematic study finding 11 new gadgets in Node.js core. Shows that prototype pollution reaching process.mainModule or spawn arguments yields RCE.',
    relatedGadgetIds: ['GDG-NODE-001'],
    relatedScenarioIds: ['scn-visitor'],
    reproduced: false,
    notes:
      'The GDG-NODE-001 gadget in BLEED is inspired by the toString class of gadgets from this research',
  },
  {
    id: 'REF-005',
    title: 'Axios 1.x Prototype Pollution via mergeConfig()',
    library: 'axios',
    property: 'baseURL',
    affectedVersions: '>=1.0.0-alpha.1 <1.6.0',
    impactClass: 'SYNTHETIC_SSRF',
    source: 'CVE Database / GH Advisory',
    cve: 'CVE-2023-45857',
    date: '2023-11-01',
    summary:
      'Axios mergeConfig() uses recursive object merge without own-property check, allowing a crafted config object to pollute Object.prototype.baseURL and redirect HTTP requests.',
    relatedGadgetIds: ['GDG-AXIOS-001'],
    relatedScenarioIds: ['scn-baseurl'],
    reproduced: true,
    notes: 'The scn-baseurl scenario directly models this CVE in the controlled lab',
  },
  {
    id: 'REF-006',
    title: 'Express.js Query Parser Prototype Pollution via qs',
    library: 'qs',
    property: '__proto__',
    affectedVersions: '<6.7.3',
    impactClass: 'SYNTHETIC_AUTH_BYPASS',
    source: 'CVE Database',
    cve: 'CVE-2022-24999',
    date: '2022-11-26',
    summary:
      'The qs query string parser allowed __proto__ keys through bracket notation, enabling prototype pollution on req.query objects in Express applications.',
    relatedGadgetIds: ['GDG-AUTH-001'],
    relatedScenarioIds: ['scn-role'],
    reproduced: false,
    notes: 'src-query-normalize in BLEED models the same vector without the qs library dependency',
  },
  {
    id: 'REF-007',
    title: 'GHunter: Finding Prototype Pollution Gadgets at Scale',
    library: 'node-core',
    property: '*',
    affectedVersions: 'multiple',
    impactClass: 'SYNTHETIC_HTTP_MANIPULATION',
    source: 'Academic: USENIX Security 2023',
    date: '2023-08-11',
    summary:
      'Automated tool for discovering prototype pollution gadgets in npm packages using static and dynamic analysis. Found 70+ new gadgets across 56 packages.',
    relatedGadgetIds: ['GDG-AXIOS-001', 'GDG-AXIOS-002', 'GDG-AXIOS-003'],
    relatedScenarioIds: ['scn-baseurl', 'scn-method'],
    reproduced: false,
    notes: "BLEED gadget inventory methodology is aligned with GHunter's classification system",
  },
  {
    id: 'REF-008',
    title: 'Using Prototype Pollution to Bypass input validation in node-forge',
    library: 'node-forge',
    property: 'prototype',
    affectedVersions: '<1.0.0',
    impactClass: 'SYNTHETIC_AUTH_BYPASS',
    source: 'Snyk Vulnerability DB',
    cve: 'CVE-2022-0122',
    date: '2022-01-06',
    summary:
      'Prototype pollution in node-forge allowed attackers to bypass signature verification in TLS implementations by polluting certificate validation logic.',
    relatedGadgetIds: ['GDG-AUTH-001'],
    relatedScenarioIds: ['scn-role'],
    reproduced: false,
    notes:
      'Demonstrates that AUTH gadgets extend beyond simple role checks to cryptographic validation',
  },
  {
    id: 'REF-009',
    title: 'Prototype Pollution in minimist and yargs',
    library: 'minimist',
    property: '__proto__',
    affectedVersions: 'minimist <1.2.6, yargs-parser <20.2.4',
    impactClass: 'SYNTHETIC_EXECUTION_MARKER',
    source: 'Snyk / CVE Database',
    cve: 'CVE-2021-44906',
    date: '2022-03-17',
    summary:
      'CLI argument parsers minimist and yargs-parser allowed __proto__ in argument names, polluting Object.prototype when user-controlled CLI arguments are parsed.',
    relatedGadgetIds: ['GDG-CB-001'],
    relatedScenarioIds: ['scn-visitor'],
    reproduced: false,
    notes:
      'Command-line argument parsing is a common but often overlooked prototype pollution source',
  },
  {
    id: 'REF-010',
    title: "Cracking the Lens: Targeting HTTP's Hidden Attack Surface",
    library: 'node-core',
    property: 'hostname',
    affectedVersions: 'multiple',
    impactClass: 'SYNTHETIC_SSRF',
    source: 'PortSwigger Research: James Kettle',
    date: '2017-09-01',
    summary:
      'Foundational SSRF research demonstrating how HTTP client configuration inheritance enables request routing attacks. The baseURL gadget class in BLEED extends this concept to prototype pollution.',
    relatedGadgetIds: ['GDG-AXIOS-001'],
    relatedScenarioIds: ['scn-baseurl'],
    reproduced: false,
    notes:
      'Pre-dates prototype pollution research but the SSRF-sim impact class maps directly to these findings',
  },
]

type FilterMode = 'all' | 'reproduced' | 'cve'

const ALL_LIBRARIES = [...new Set(FALLBACK_REFS.map(r => r.library).filter(Boolean))] as string[]

export default function Research() {
  const [refs, setRefs] = useState<ResearchReference[]>(FALLBACK_REFS)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [libraryFilter, setLibraryFilter] = useState<string>('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('http://localhost:4001/api/research')
      .then(r => r.json())
      .then((data: ResearchReference[]) => {
        if (Array.isArray(data) && data.length > 0) setRefs(data)
      })
      .catch(() => { /* use fallback */ })
  }, [])

  const visible = useMemo(() => {
    let list = refs
    if (filter === 'reproduced') list = list.filter(r => r.reproduced)
    if (filter === 'cve') list = list.filter(r => !!r.cve)
    if (libraryFilter) list = list.filter(r => r.library === libraryFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.library?.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q),
      )
    }
    return list
  }, [refs, filter, libraryFilter, query])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Reference</div>
        <h1 className="text-2xl font-bold">Research Catalog</h1>
        <p className="text-ivory/50 text-sm mt-1">
          CVE references and research papers informing the BLEED gadget model.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'reproduced', 'cve'] as FilterMode[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
              filter === f
                ? 'bg-coral/15 text-coral border-coral/30'
                : 'text-ivory/40 border-border hover:text-ivory/70 hover:border-ivory/20'
            }`}
          >
            {f === 'all' ? 'All' : f === 'reproduced' ? 'Reproduced in Lab' : 'CVE'}
          </button>
        ))}
        <select
          value={libraryFilter}
          onChange={e => setLibraryFilter(e.target.value)}
          className="bg-graphite border border-border text-xs font-mono text-ivory/50 rounded px-2 py-1.5 hover:border-ivory/20 focus:outline-none focus:border-coral/30"
        >
          <option value="">All Libraries</option>
          {ALL_LIBRARIES.map(lib => (
            <option key={lib} value={lib}>{lib}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto border border-border rounded px-3 py-1.5 hover:border-ivory/20 transition-colors">
          <Search size={12} className="text-ivory/30 flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title, summary…"
            className="bg-transparent text-xs font-mono text-ivory placeholder-ivory/20 focus:outline-none w-48"
          />
        </div>
      </div>

      {/* Count */}
      <div className="text-xs font-mono text-ivory/30">
        {visible.length} of {refs.length} references
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {visible.map(ref => (
          <div
            key={ref.id}
            className="bg-surface border border-border rounded-lg p-5 space-y-3 hover:border-ivory/15 transition-colors"
          >
            <div className="flex items-start gap-3 flex-wrap">
              <span className="font-mono text-xs text-iris bg-iris/10 border border-iris/30 px-2 py-0.5 rounded">
                {ref.id}
              </span>
              {ref.cve && (
                <span className="font-mono text-xs text-coral bg-coral/10 border border-coral/30 px-2 py-0.5 rounded">
                  {ref.cve}
                </span>
              )}
              {ref.reproduced ? (
                <span className="font-mono text-xs text-sage bg-sage/10 border border-sage/30 px-2 py-0.5 rounded">
                  Reproduced in Lab
                </span>
              ) : (
                <span className="font-mono text-xs text-marigold bg-marigold/10 border border-marigold/30 px-2 py-0.5 rounded">
                  Research Reference
                </span>
              )}
            </div>

            <h3 className="font-bold text-ivory text-base leading-snug">{ref.title}</h3>

            {(ref.library || ref.affectedVersions) && (
              <div className="flex gap-4 text-xs font-mono text-ivory/40">
                {ref.library && <span>{ref.library}</span>}
                {ref.affectedVersions && (
                  <span className="text-ivory/30">versions: {ref.affectedVersions}</span>
                )}
              </div>
            )}

            <p className="text-sm text-ivory/65 leading-relaxed">{ref.summary}</p>

            {ref.relatedGadgetIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-ivory/30">Gadgets:</span>
                {ref.relatedGadgetIds.map(gid => (
                  <Link
                    key={gid}
                    to={`/gadgets/${gid}`}
                    className="font-mono text-xs text-ivory/50 hover:text-coral bg-ivory/5 border border-border px-2 py-0.5 rounded hover:border-coral/30 transition-colors"
                  >
                    {gid}
                  </Link>
                ))}
              </div>
            )}

            {ref.relatedScenarioIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-ivory/30">Scenarios:</span>
                {ref.relatedScenarioIds.map(sid => (
                  <span
                    key={sid}
                    className="font-mono text-xs text-ivory/40 bg-ivory/5 border border-border px-2 py-0.5 rounded"
                  >
                    {sid}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 text-xs font-mono text-ivory/30 border-t border-border pt-3">
              <span>{ref.source}</span>
              {ref.date && <span>· {ref.date}</span>}
            </div>

            {ref.notes && (
              <div className="text-xs text-ivory/30 border-l-2 border-border pl-3 italic">
                {ref.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 text-ivory/25 text-sm font-mono">
          No references match the current filters.
        </div>
      )}
    </div>
  )
}
