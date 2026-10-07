import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
  variant?: 'vulnerable' | 'hardened' | 'neutral'
}

export default function CodeBlock({ code, language = 'js', label, variant = 'neutral' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const headerColor = {
    vulnerable: 'border-coral/40 bg-coral/5',
    hardened: 'border-sage/40 bg-sage/5',
    neutral: 'border-border bg-border/40',
  }[variant]

  const labelColor = {
    vulnerable: 'text-coral',
    hardened: 'text-sage',
    neutral: 'text-ivory/40',
  }[variant]

  return (
    <div className="rounded-md border border-border overflow-hidden">
      {label && (
        <div className={`flex items-center justify-between px-4 py-2 border-b ${headerColor}`}>
          <span className={`text-xs font-mono font-medium ${labelColor}`}>{label}</span>
          <button
            onClick={copy}
            className="text-ivory/30 hover:text-ivory transition-colors"
          >
            {copied ? <Check size={14} className="text-sage" /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <div className="relative">
        {!label && (
          <button
            onClick={copy}
            className="absolute top-3 right-3 text-ivory/20 hover:text-ivory/60 transition-colors z-10"
          >
            {copied ? <Check size={12} className="text-sage" /> : <Copy size={12} />}
          </button>
        )}
        <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-ivory/80 bg-graphite/60">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

interface CodeDiffProps {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
}

export function CodeDiff({ before, after, beforeLabel = 'VULNERABLE', afterLabel = 'HARDENED' }: CodeDiffProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <CodeBlock code={before} label={beforeLabel} variant="vulnerable" />
      <CodeBlock code={after} label={afterLabel} variant="hardened" />
    </div>
  )
}
