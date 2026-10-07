import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Pause, Play, X, ShieldAlert,
  CheckCircle2, AlertCircle, Zap, Database, Link2, ArrowRight,
} from 'lucide-react'
import BleedPathAnimation from '../components/chain/BleedPathAnimation'
import { mockChains, mockSources, mockMetrics } from '../api/mockData'

// ─── Constants ────────────────────────────────────────────────────────────────

const SLIDE_DURATION = 5000 // ms
const TOTAL_SLIDES = 8

// ─── Slide definitions ────────────────────────────────────────────────────────

const slideData = [
  {
    id: 1,
    title: 'The Research Platform',
    subtitle: 'BLEED — Server-Side Prototype Pollution Research',
    tag: 'OVERVIEW',
    tagColor: 'text-iris border-iris/30 bg-iris/5',
  },
  {
    id: 2,
    title: 'Pollution Source',
    subtitle: 'Unsafe recursive merge — entry point for prototype pollution',
    tag: 'SOURCE-001',
    tagColor: 'text-marigold border-marigold/30 bg-marigold/5',
  },
  {
    id: 3,
    title: 'The Attack Chain',
    subtitle: 'CHN-001: deepMerge → axios baseURL → SSRF',
    tag: 'CHN-001',
    tagColor: 'text-coral border-coral/30 bg-coral/5',
  },
  {
    id: 4,
    title: 'Property Propagation',
    subtitle: '.baseURL travels from attacker input through Object.prototype to all objects',
    tag: 'PROPAGATION',
    tagColor: 'text-iris border-iris/30 bg-iris/5',
  },
  {
    id: 5,
    title: 'Gadget Activation',
    subtitle: 'GAD-001: axios mergeConfig() reads baseURL without own-property check',
    tag: 'GAD-001',
    tagColor: 'text-marigold border-marigold/30 bg-marigold/5',
  },
  {
    id: 6,
    title: 'Controlled Impact',
    subtitle: 'SYNTHETIC_SSRF — HTTP request issued to attacker-controlled baseURL',
    tag: 'REPRODUCED',
    tagColor: 'text-coral border-coral/30 bg-coral/5',
  },
  {
    id: 7,
    title: 'Hardened Comparison',
    subtitle: 'Prototype key guard blocks __proto__ assignment at merge time',
    tag: 'BLOCKED',
    tagColor: 'text-sage border-sage/30 bg-sage/5',
  },
  {
    id: 8,
    title: 'Research Coverage',
    subtitle: 'Complete platform metrics — sources, gadgets, chains, runs',
    tag: 'METRICS',
    tagColor: 'text-iris border-iris/30 bg-iris/5',
  },
]

// ─── Individual slide content ─────────────────────────────────────────────────

function Slide1() {
  const metrics = [
    { label: 'Sources', value: mockMetrics.sources, color: 'text-marigold' },
    { label: 'Gadgets', value: mockMetrics.gadgets, color: 'text-iris' },
    { label: 'Chains', value: mockMetrics.reachableChains, color: 'text-coral' },
    { label: 'Reproduced', value: mockMetrics.reproducedChains, color: 'text-coral' },
    { label: 'Hardened', value: mockMetrics.hardenedBlocked, color: 'text-sage' },
    { label: 'Total Runs', value: mockMetrics.totalRuns, color: 'text-ivory/70' },
  ]
  return (
    <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto w-full">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="bg-surface/60 border border-border rounded-lg p-6 text-center"
        >
          <div className={`text-4xl font-bold font-mono mb-2 ${m.color}`}>{m.value}</div>
          <div className="text-xs font-mono text-ivory/40 uppercase tracking-widest">{m.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

function Slide2() {
  const src = mockSources[0]!
  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-ivory/30">{src.id}</span>
        <span className="font-mono text-xs text-marigold">{src.category}</span>
      </div>
      <div className="text-lg font-medium text-ivory">{src.name}</div>
      <div className="text-sm text-ivory/60 leading-relaxed">{src.description}</div>
      <div className="bg-graphite/80 border border-border rounded-md overflow-hidden">
        <div className="px-4 py-2 border-b border-border text-xs font-mono text-coral uppercase tracking-wider bg-coral/5">
          Vulnerable — {src.functionName}()
        </div>
        <pre className="px-4 py-4 text-xs font-mono text-ivory/70 overflow-x-auto whitespace-pre leading-relaxed">
          {src.vulnerableCode}
        </pre>
      </div>
    </div>
  )
}

function Slide3() {
  const chain = mockChains[0]!
  return (
    <div className="max-w-3xl mx-auto w-full">
      <BleedPathAnimation chain={chain} autoPlay />
    </div>
  )
}

function Slide4() {
  const objects = ['config {}', 'requestOptions {}', 'axios defaults {}', 'req.options {}', 'settings {}']
  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <div className="text-center">
        <div className="font-mono text-2xl text-coral font-bold mb-2">.baseURL</div>
        <div className="text-sm text-ivory/50">propagating from Object.prototype to all plain objects</div>
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <div className="bg-surface border border-coral rounded-md px-4 py-2 font-mono text-sm text-coral">
          Object.prototype
        </div>
        <ArrowRight className="text-coral/50 shrink-0" size={20} />
        <div className="flex flex-wrap gap-2 justify-center">
          {objects.map((obj, i) => (
            <motion.div
              key={obj}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
              className="bg-surface border border-iris/40 rounded-md px-3 py-2 font-mono text-xs text-iris"
            >
              {obj}
              <div className="text-coral mt-0.5 text-xs">.baseURL = ⚠</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="text-center text-xs font-mono text-ivory/30 mt-4">
        14 objects affected in simulated lab environment
      </div>
    </div>
  )
}

function Slide5() {
  const gad = {
    id: 'GAD-001',
    library: 'axios',
    versionRange: '<1.6.0',
    trigger: 'axios.request() / mergeConfig()',
    category: 'HTTP',
  }
  return (
    <div className="max-w-2xl mx-auto w-full space-y-5">
      <div className="bg-surface border border-marigold/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={18} className="text-marigold" />
          <span className="font-mono text-sm text-marigold font-bold">{gad.id}</span>
          <span className="font-mono text-xs text-ivory/30">{gad.library} {gad.versionRange}</span>
        </div>
        <div className="space-y-2 text-sm font-mono">
          <div><span className="text-ivory/40">Category: </span><span className="text-marigold">{gad.category}</span></div>
          <div><span className="text-ivory/40">Trigger: </span><span className="text-ivory/80">{gad.trigger}</span></div>
          <div><span className="text-ivory/40">Property: </span><span className="text-coral">.baseURL</span></div>
        </div>
      </div>
      <div className="bg-graphite/60 border border-border rounded-md p-4 font-mono text-xs text-ivory/60 leading-relaxed">
        <div className="text-ivory/30 mb-2">// Inside axios mergeConfig() — no hasOwnProperty guard</div>
        <div className="text-marigold">config.baseURL</div>
        <div className="text-ivory/40 ml-4">// → reads from Object.prototype when config has no own baseURL</div>
        <div className="text-ivory/40 ml-4">// → returns attacker-controlled value</div>
        <div className="text-coral mt-2">// HTTP request issued to: http://attacker.internal/ssrf</div>
      </div>
    </div>
  )
}

function Slide6() {
  return (
    <div className="max-w-xl mx-auto w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-coral/10 border border-coral/40 rounded-lg p-8 text-center"
      >
        <AlertCircle size={40} className="text-coral mx-auto mb-4" />
        <div className="font-mono text-xs text-coral/60 uppercase tracking-widest mb-2">CONTROLLED LAB IMPACT</div>
        <div className="font-mono text-2xl font-bold text-coral mb-3">SYNTHETIC_SSRF</div>
        <div className="text-sm text-ivory/60 leading-relaxed">
          HTTP GET issued to <span className="font-mono text-coral">http://attacker.internal/ssrf</span>
          <br />Simulated in isolated lab environment — synthetic data only
        </div>
      </motion.div>
      <div className="text-center text-xs font-mono text-ivory/30">
        Impact reproduced in {mockChains[0]?.evidence.length ?? 3} evidence records — RUN-001 completed in 101ms
      </div>
    </div>
  )
}

function Slide7() {
  return (
    <div className="max-w-xl mx-auto w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-sage/10 border border-sage/40 rounded-lg p-8 text-center"
      >
        <CheckCircle2 size={40} className="text-sage mx-auto mb-4" />
        <div className="font-mono text-xs text-sage/60 uppercase tracking-widest mb-2">HARDENED FIXTURE</div>
        <div className="font-mono text-2xl font-bold text-sage mb-3">BLOCKED</div>
        <div className="text-sm text-ivory/60 leading-relaxed">
          deepMerge key guard rejected <span className="font-mono text-marigold">__proto__</span> assignment
          <br />Object.prototype remained clean — no gadget reachable
        </div>
      </motion.div>
      <div className="bg-graphite/60 border border-sage/20 rounded-md p-4 font-mono text-xs">
        <div className="text-sage/60 mb-1">// Hardened guard (deepMerge)</div>
        <div className="text-ivory/60">{'if (key === "__proto__" || key === "constructor") continue'}</div>
        <div className="text-sage mt-2">// ✓ Pollution blocked in 12ms</div>
      </div>
    </div>
  )
}

function Slide8() {
  const allMetrics = [
    { label: 'Pollution Sources',     value: 20,  sub: 'confirmed + theoretical', color: 'text-marigold' },
    { label: 'Known Gadgets',         value: 36,  sub: 'across HTTP, AUTH, EXEC', color: 'text-iris' },
    { label: 'Attack Chains',         value: 20,  sub: 'modelled end-to-end',      color: 'text-coral' },
    { label: 'Research Runs',         value: mockMetrics.totalRuns, sub: 'documented with evidence', color: 'text-ivory/70' },
    { label: 'Hardened & Blocked',    value: mockMetrics.hardenedBlocked, sub: 'mitigations verified',  color: 'text-sage' },
    { label: 'Reproduced Chains',     value: mockMetrics.reproducedChains, sub: 'full impact observed', color: 'text-coral' },
  ]
  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto w-full">
      {allMetrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="bg-surface/60 border border-border rounded-lg p-5 text-center"
        >
          <div className={`text-4xl font-bold font-mono mb-1 ${m.color}`}>{m.value}</div>
          <div className="text-xs font-mono text-ivory/60 font-medium mb-0.5">{m.label}</div>
          <div className="text-xs font-mono text-ivory/25">{m.sub}</div>
        </motion.div>
      ))}
    </div>
  )
}

const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Showcase() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef(0)

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
    setProgress(0)
    tickRef.current = 0
  }, [])

  const goNext = useCallback(() => {
    setCurrent(c => (c + 1) % TOTAL_SLIDES)
    setProgress(0)
    tickRef.current = 0
  }, [])

  const goPrev = useCallback(() => {
    setCurrent(c => (c - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)
    setProgress(0)
    tickRef.current = 0
  }, [])

  // Auto-advance timer
  useEffect(() => {
    if (!playing) {
      if (progressRef.current) clearInterval(progressRef.current)
      return
    }
    const interval = 50 // ms per tick
    const ticks = SLIDE_DURATION / interval
    progressRef.current = setInterval(() => {
      tickRef.current += 1
      setProgress(Math.min((tickRef.current / ticks) * 100, 100))
      if (tickRef.current >= ticks) {
        tickRef.current = 0
        setCurrent(c => (c + 1) % TOTAL_SLIDES)
        setProgress(0)
      }
    }, interval)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [playing, current])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') navigate('/dashboard')
      else if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, navigate])

  const slide = slideData[current]!
  const SlideContent = SLIDE_COMPONENTS[current]!

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'hsl(220 13% 11%)' }}>
      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 w-full absolute top-0 left-0">
        <motion.div
          className="h-full bg-coral"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 mt-0.5">
        <div className="flex items-center gap-3">
          <ShieldAlert size={16} className="text-coral" />
          <span className="font-mono text-xs font-bold text-ivory/60 tracking-widest uppercase">Showcase Mode</span>
          <span className="font-mono text-xs text-ivory/25">{current + 1} / {TOTAL_SLIDES}</span>
        </div>

        {/* Slide tag */}
        <div className={`font-mono text-xs font-bold border px-3 py-1 rounded ${slide.tagColor}`}>
          {slide.tag}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="flex items-center gap-1.5 font-mono text-xs text-ivory/40 hover:text-ivory border border-white/10 px-3 py-1.5 rounded hover:border-white/20 transition-colors"
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
            {playing ? 'PAUSE' : 'PLAY'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 font-mono text-xs text-ivory/40 hover:text-ivory border border-white/10 px-3 py-1.5 rounded hover:border-white/20 transition-colors"
          >
            <X size={12} />
            EXIT
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-hidden">
        {/* Slide title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current + '-header'}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-ivory mb-2">{slide.title}</h2>
            <p className="text-sm text-ivory/40 font-mono max-w-xl">{slide.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current + '-content'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full flex justify-center"
          >
            <SlideContent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
        {/* Prev */}
        <button
          onClick={goPrev}
          className="flex items-center gap-1.5 font-mono text-xs text-ivory/40 hover:text-ivory border border-white/10 px-4 py-2 rounded hover:border-white/20 transition-colors"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-5 h-2 bg-coral'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
              title={slideData[i]?.title}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={goNext}
          className="flex items-center gap-1.5 font-mono text-xs text-ivory/40 hover:text-ivory border border-white/10 px-4 py-2 rounded hover:border-white/20 transition-colors"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-14 right-6 text-xs font-mono text-ivory/15">
        ← → navigate · Space pause · Esc exit
      </div>
    </div>
  )
}
