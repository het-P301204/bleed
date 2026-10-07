import type { LabService } from '@bleed/shared'
import { StatusBadge } from '../common/Badge'
import { Server } from 'lucide-react'

interface LabServiceStatusProps {
  services: LabService[]
}

export default function LabServiceStatus({ services }: LabServiceStatusProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {services.map(svc => (
        <div key={svc.id} className="bg-surface border border-border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Server size={14} className="text-ivory/40" />
            <span className="text-sm font-medium text-ivory">{svc.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge status={svc.status} />
            <span className="text-xs font-mono text-ivory/30">:{svc.port}</span>
          </div>
          <p className="text-xs text-ivory/40 mt-2 leading-snug">{svc.description}</p>
        </div>
      ))}
    </div>
  )
}
