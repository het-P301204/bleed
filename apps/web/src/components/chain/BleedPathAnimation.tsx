import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Chain, ChainNode } from '@bleed/shared'

const nodeTypeColors: Record<string, string> = {
  INPUT: 'border-ivory/40 text-ivory',
  PARSER: 'border-marigold/50 text-marigold',
  MERGE: 'border-marigold/60 text-marigold',
  PROTOTYPE: 'border-coral text-coral',
  OBJECT: 'border-iris/50 text-iris',
  LIBRARY: 'border-iris/60 text-iris',
  GADGET: 'border-coral/70 text-coral',
  TARGET: 'border-coral/80 text-coral',
  IMPACT: 'border-coral text-coral font-bold',
}

interface BleedPathAnimationProps {
  chain: Chain
  autoPlay?: boolean
}

export default function BleedPathAnimation({ chain, autoPlay = true }: BleedPathAnimationProps) {
  const [visibleCount, setVisibleCount] = useState(autoPlay ? 0 : chain.nodes.length)
  const [dotProgress, setDotProgress] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!playing) return
    if (visibleCount < chain.nodes.length) {
      const t = setTimeout(() => setVisibleCount((v: number) => v + 1), 400)
      return () => clearTimeout(t)
    } else {
      // animate dot
      const t = setTimeout(() => {
        setDotProgress(chain.nodes.length)
        setPlaying(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [playing, visibleCount, chain.nodes.length])

  const replay = () => {
    setVisibleCount(0)
    setDotProgress(0)
    setPlaying(true)
  }

  return (
    <div className="rounded-lg border border-border bg-graphite/60 p-6 overflow-x-auto">
      {/* Property label */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs font-mono text-ivory/40">Tracing property:</span>
        <span className="font-mono text-sm text-coral font-medium border border-coral/30 px-2 py-0.5 rounded bg-coral/5">
          .{chain.property}
        </span>
        <button
          onClick={replay}
          className="ml-auto text-xs font-mono text-ivory/30 hover:text-ivory border border-border px-2 py-1 rounded hover:border-ivory/30 transition-colors"
        >
          ↺ replay
        </button>
      </div>

      {/* Node chain */}
      <div className="flex items-center gap-0 flex-wrap">
        {chain.nodes.map((node: ChainNode, i: number) => {
          const colorClass = nodeTypeColors[node.type] ?? 'border-border text-ivory/60'
          const visible = i < visibleCount

          return (
            <div key={node.id} className="flex items-center">
              <AnimatePresence>
                {visible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col items-center"
                  >
                    {/* Node box */}
                    <div className={`relative border rounded-sm px-3 py-2 min-w-[100px] text-center ${colorClass} bg-surface/60`}>
                      <div className="text-xs font-mono text-current/50 mb-0.5 uppercase tracking-wider">{node.type}</div>
                      <div className="text-xs font-medium text-current">{node.label}</div>
                      {node.property && (
                        <div className="text-xs font-mono text-coral mt-0.5">.{node.property}</div>
                      )}

                      {/* Animated dot on node when it's the frontline */}
                      {i === visibleCount - 1 && playing && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-coral"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edge arrow */}
              {i < chain.nodes.length - 1 && visible && i + 1 <= visibleCount && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  className="flex flex-col items-center px-1"
                  style={{ transformOrigin: 'left' }}
                >
                  {chain.edges[i] && (
                    <span className="text-xs font-mono text-ivory/20 block text-center" style={{ fontSize: '9px' }}>
                      {chain.edges[i]!.type}
                    </span>
                  )}
                  <div className="flex items-center">
                    <div className="w-6 h-px bg-border" />
                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-border" />
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* Impact banner */}
      <AnimatePresence>
        {visibleCount >= chain.nodes.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded border border-coral/30 bg-coral/5 px-4 py-3 text-center"
          >
            <div className="text-xs font-mono text-coral/60 mb-1">CONTROLLED LAB IMPACT — synthetic data only</div>
            <div className="text-sm font-mono font-medium text-coral">{chain.impact}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
