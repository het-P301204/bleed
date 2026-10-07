import type { RuntimeEvent } from '@bleed/shared'
import { StatusBadge } from './Badge'

const eventIcons: Record<string, string> = {
  INPUT_RECEIVED: '→',
  MERGE_EXECUTED: '⊕',
  PROTOTYPE_POLLUTED: '⚡',
  PROPERTY_INHERITED: '↓',
  GADGET_TRIGGERED: '◈',
  IMPACT_EXECUTED: '✦',
  HARDENED_BLOCKED: '⊗',
  ERROR: '✕',
}

const eventColors: Record<string, string> = {
  INPUT_RECEIVED: 'text-ivory/60 bg-border',
  MERGE_EXECUTED: 'text-marigold bg-marigold/20',
  PROTOTYPE_POLLUTED: 'text-coral bg-coral/20',
  PROPERTY_INHERITED: 'text-coral/70 bg-coral/10',
  GADGET_TRIGGERED: 'text-marigold bg-marigold/20',
  IMPACT_EXECUTED: 'text-coral bg-coral/30',
  HARDENED_BLOCKED: 'text-sage bg-sage/20',
  ERROR: 'text-coral bg-coral/20',
}

interface TimelineProps {
  events: RuntimeEvent[]
  activeIndex?: number
  onSelect?: (index: number) => void
}

export default function Timeline({ events, activeIndex, onSelect }: TimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((evt, i) => {
        const isActive = activeIndex !== undefined && i <= activeIndex
        const isCurrent = i === activeIndex
        const color = eventColors[evt.type] ?? 'text-ivory/60 bg-border'
        const icon = eventIcons[evt.type] ?? '·'

        return (
          <div
            key={evt.id}
            className={`flex gap-4 cursor-pointer group ${isCurrent ? 'opacity-100' : isActive ? 'opacity-80' : 'opacity-40'}`}
            onClick={() => onSelect?.(i)}
          >
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${color} ${isCurrent ? 'ring-2 ring-coral/50' : ''}`}>
                {icon}
              </div>
              {i < events.length - 1 && (
                <div className="w-px flex-1 min-h-[24px] bg-border mt-1 mb-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={evt.type} />
                {evt.relativeMs !== undefined && (
                  <span className="text-xs font-mono text-ivory/30">+{evt.relativeMs}ms</span>
                )}
                {evt.property && (
                  <span className="text-xs font-mono text-coral/70">.{evt.property}</span>
                )}
              </div>
              <p className="text-sm text-ivory/70 mt-1 leading-snug">{evt.description}</p>
              {evt.value !== undefined && (
                <pre className="mt-1.5 text-xs font-mono text-ivory/40 bg-graphite/60 rounded px-2 py-1 overflow-x-auto">
                  {JSON.stringify(evt.value, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
