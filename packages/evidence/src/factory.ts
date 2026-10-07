import { randomUUID } from 'node:crypto'
import type { Evidence, ResearchRun, RuntimeEvent, RuntimeEventType, ResearchNote } from '@bleed/shared'

export function createEvidence(
  partial: Pick<Evidence, 'property' | 'origin' | 'description' | 'fixtureVersion'> &
    Partial<Omit<Evidence, 'property' | 'origin' | 'description' | 'fixtureVersion'>>,
): Evidence {
  return {
    id: randomUUID(),
    timestamp: Date.now(),
    ...partial,
  }
}

export function createRuntimeEvent(
  type: RuntimeEventType,
  description: string,
  partial?: Partial<Omit<RuntimeEvent, 'id' | 'type' | 'description' | 'timestamp' | 'relativeMs'>>,
  startTime = Date.now(),
): RuntimeEvent {
  const now = Date.now()
  return {
    id: randomUUID(),
    type,
    timestamp: now,
    relativeMs: now - startTime,
    description,
    ...partial,
  }
}

export function createResearchNote(content: string, linkedId?: string, linkedType?: ResearchNote['linkedType']): ResearchNote {
  const note: ResearchNote = {
    id: randomUUID(),
    content,
    timestamp: Date.now(),
  }
  if (linkedId !== undefined) note.linkedId = linkedId
  if (linkedType !== undefined) note.linkedType = linkedType
  return note
}

export function createRun(partial: Omit<ResearchRun, 'id' | 'timestamp'>): ResearchRun {
  return {
    id: randomUUID(),
    timestamp: Date.now(),
    ...partial,
  }
}
