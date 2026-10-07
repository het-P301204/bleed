interface MetricCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: 'coral' | 'sage' | 'marigold' | 'iris'
}

const accentMap = {
  coral: 'text-coral',
  sage: 'text-sage',
  marigold: 'text-marigold',
  iris: 'text-iris',
}

export default function MetricCard({ label, value, sub, accent = 'coral' }: MetricCardProps) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className={`text-3xl font-bold font-mono ${accentMap[accent]}`}>{value}</div>
      <div className="text-ivory/70 text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-ivory/30 text-xs font-mono mt-0.5">{sub}</div>}
    </div>
  )
}
