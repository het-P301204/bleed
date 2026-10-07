import type { ResearchRun } from '@bleed/shared'

const runs = new Map<string, ResearchRun>()

export function storeRun(run: ResearchRun): void {
  runs.set(run.id, run)
}

export function getRun(id: string): ResearchRun | undefined {
  return runs.get(id)
}

export function getAllRuns(): ResearchRun[] {
  return Array.from(runs.values()).sort((a, b) => b.timestamp - a.timestamp)
}

export function deleteRun(id: string): boolean {
  return runs.delete(id)
}

export function getRunCount(): number {
  return runs.size
}

export function getLastRunAt(): number | undefined {
  let latest = 0
  for (const run of runs.values()) {
    if (run.timestamp > latest) latest = run.timestamp
  }
  return latest > 0 ? latest : undefined
}
