import { create } from 'zustand'
import type { LabState } from '@bleed/shared'
import { mockLabState } from '../api/mockData'

interface LabStore {
  lab: LabState
  setLab: (lab: LabState) => void
  fetchLab: () => Promise<void>
}

export const useLabStore = create<LabStore>((set) => ({
  lab: mockLabState,
  setLab: (lab) => set({ lab }),
  fetchLab: async () => {
    try {
      const r = await fetch('/api/lab/state')
      if (r.ok) {
        const data = await r.json() as LabState
        set({ lab: data })
      }
    } catch {
      // keep mock data
    }
  },
}))
