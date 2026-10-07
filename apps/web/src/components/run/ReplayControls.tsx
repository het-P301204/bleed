import { useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useRunsStore } from '../../store/runs'

export default function ReplayControls() {
  const { activeRun, replayIndex, isReplaying, setReplayIndex, stepForward, stepBack, startReplay, stopReplay } = useRunsStore()

  const max = (activeRun?.events.length ?? 1) - 1

  useEffect(() => {
    if (!isReplaying) return
    const t = setInterval(() => {
      const { replayIndex, activeRun } = useRunsStore.getState()
      if (activeRun && replayIndex < activeRun.events.length - 1) {
        stepForward()
      } else {
        stopReplay()
      }
    }, 800)
    return () => clearInterval(t)
  }, [isReplaying, stepForward, stopReplay])

  const jumpToGadget = () => {
    if (!activeRun) return
    const idx = activeRun.events.findIndex(e => e.type === 'GADGET_TRIGGERED')
    if (idx >= 0) setReplayIndex(idx)
  }

  const jumpToImpact = () => {
    if (!activeRun) return
    const idx = activeRun.events.findIndex(e => e.type === 'IMPACT_EXECUTED')
    if (idx >= 0) setReplayIndex(idx)
  }

  return (
    <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-4 py-3">
      {/* Progress */}
      <span className="text-xs font-mono text-ivory/30 w-16">{replayIndex + 1}/{max + 1}</span>

      {/* Scrubber */}
      <div className="flex-1 h-1 bg-border rounded-full relative">
        <div
          className="absolute left-0 top-0 h-1 bg-coral rounded-full transition-all"
          style={{ width: `${(replayIndex / max) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={replayIndex}
          onChange={e => setReplayIndex(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button onClick={() => setReplayIndex(0)} className="p-1.5 text-ivory/40 hover:text-ivory rounded hover:bg-white/5 transition-colors">
          <ChevronsLeft size={14} />
        </button>
        <button onClick={stepBack} className="p-1.5 text-ivory/40 hover:text-ivory rounded hover:bg-white/5 transition-colors">
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => isReplaying ? stopReplay() : startReplay()}
          className="p-1.5 text-ivory rounded bg-coral/20 hover:bg-coral/30 transition-colors"
        >
          {isReplaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={stepForward} className="p-1.5 text-ivory/40 hover:text-ivory rounded hover:bg-white/5 transition-colors">
          <SkipForward size={14} />
        </button>
        <button onClick={() => setReplayIndex(max)} className="p-1.5 text-ivory/40 hover:text-ivory rounded hover:bg-white/5 transition-colors">
          <ChevronsRight size={14} />
        </button>
      </div>

      {/* Jump buttons */}
      <div className="flex gap-1 ml-2">
        <button
          onClick={jumpToGadget}
          className="text-xs font-mono text-marigold/70 hover:text-marigold border border-marigold/20 hover:border-marigold/40 px-2 py-1 rounded transition-colors"
        >
          → Gadget
        </button>
        <button
          onClick={jumpToImpact}
          className="text-xs font-mono text-coral/70 hover:text-coral border border-coral/20 hover:border-coral/40 px-2 py-1 rounded transition-colors"
        >
          → Impact
        </button>
      </div>
    </div>
  )
}
