import { create } from 'zustand'
import type { ResearchRun, Chain } from '@bleed/shared'
import { mockRuns, mockChains } from '../api/mockData'

interface RunsStore {
  runs: ResearchRun[]
  activeRun: ResearchRun | null
  replayIndex: number
  isReplaying: boolean
  setRuns: (runs: ResearchRun[]) => void
  setActiveRun: (run: ResearchRun | null) => void
  setReplayIndex: (i: number) => void
  stepForward: () => void
  stepBack: () => void
  startReplay: () => void
  stopReplay: () => void
  addRun: (run: ResearchRun) => void
}

export const useRunsStore = create<RunsStore>((set, get) => ({
  runs: mockRuns,
  activeRun: null,
  replayIndex: 0,
  isReplaying: false,
  setRuns: (runs) => set({ runs }),
  setActiveRun: (run) => set({ activeRun: run, replayIndex: 0, isReplaying: false }),
  setReplayIndex: (i) => set({ replayIndex: i }),
  stepForward: () => {
    const { activeRun, replayIndex } = get()
    if (!activeRun) return
    const max = activeRun.events.length - 1
    set({ replayIndex: Math.min(replayIndex + 1, max) })
  },
  stepBack: () => {
    const { replayIndex } = get()
    set({ replayIndex: Math.max(replayIndex - 1, 0) })
  },
  startReplay: () => set({ isReplaying: true }),
  stopReplay: () => set({ isReplaying: false }),
  addRun: (run) => set((s) => ({ runs: [run, ...s.runs] })),
}))

export const useChainBuilderStore = create<{
  selectedSourceId: string | null
  selectedGadgetId: string | null
  selectedTarget: string
  builtChain: Chain | null
  setSource: (id: string) => void
  setGadget: (id: string) => void
  setTarget: (t: string) => void
  setBuiltChain: (c: Chain | null) => void
  reset: () => void
}>((set) => ({
  selectedSourceId: null,
  selectedGadgetId: null,
  selectedTarget: 'http-sim',
  builtChain: null,
  setSource: (id) => set({ selectedSourceId: id, selectedGadgetId: null }),
  setGadget: (id) => set({ selectedGadgetId: id }),
  setTarget: (t) => set({ selectedTarget: t }),
  setBuiltChain: (c) => set({ builtChain: c }),
  reset: () => set({ selectedSourceId: null, selectedGadgetId: null, builtChain: null }),
}))
