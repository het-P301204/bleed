export default function Methodology() {
  const sections = [
    {
      id: 'source',
      title: 'Pollution Source',
      content: `A pollution source is an application code path that takes untrusted input and merges it into a JavaScript object without filtering the keys __proto__, constructor, or prototype.

When an attacker supplies JSON like {"__proto__": {"key": "value"}}, and that JSON is merged using a naive recursive merge or Object.assign(), the assignment target[key] = value with key === "__proto__" writes directly to the target object's prototype — which, for plain objects, is Object.prototype.

BLEED identifies sources by their merge strategy:
• RECURSIVE_MERGE — deepMerge(target, source) traversing nested objects
• UNSAFE_MERGE — Object.assign or spread without key filtering
• QUERY_NORMALIZE — query string parsers accepting bracket notation
• DEEP_PARSER — JSON/YAML parsers used with direct assignment
• CONFIG_MERGE — configuration loading merging into defaults
• PROPERTY_ASSIGN — direct property assignment from request data`,
    },
    {
      id: 'gadget',
      title: 'Gadget',
      content: `A gadget is a library or framework code path that reads a property from an object without checking hasOwnProperty. Because JavaScript property lookup walks the prototype chain, any property on Object.prototype appears to exist on every plain object.

The dangerous pattern is:
  const value = config.someProperty // no hasOwnProperty check

If an attacker has written Object.prototype.someProperty = "evil", then config.someProperty returns "evil" even though config has no own property with that key.

BLEED models gadgets by their category:
• HTTP — read baseURL, agent, proxy from HTTP client config
• AUTH — read admin, role, isAdmin from session or auth objects
• EXECUTION_SIM — read outputFunctionName, shell from template/VM options
• CALLBACK — read helper functions from template helper registries
• FILE — read paths or flags from file operation options
• ROUTING — read path prefixes or redirects from router config`,
    },
    {
      id: 'reachability',
      title: 'Reachability',
      content: `A chain is "reachable" when a pollution source can reach the gadget through normal application flows — i.e., the attacker's input passes through the source and the polluted property is present when the gadget reads it.

Reachability states in BLEED:
• POTENTIAL — static analysis suggests the chain may work; unverified
• REACHABLE — runtime tracing confirms the gadget reads the property after pollution
• REPRODUCED — the gadget produced a controlled lab impact
• BLOCKED — a mitigation prevents propagation or gadget use
• INCONCLUSIVE — trace was ambiguous; more evidence required`,
    },
    {
      id: 'reproduction',
      title: 'Controlled Reproduction',
      content: `A chain reaches "REPRODUCED" status when the lab environment captures a runtime event confirming:

1. The pollution source wrote to Object.prototype (PROTOTYPE_POLLUTED event)
2. The polluted property propagated to objects the gadget will read (PROPERTY_INHERITED event)
3. The gadget read the property from inheritance rather than own data (GADGET_TRIGGERED event)
4. The gadget produced a measurable synthetic effect (IMPACT_EXECUTED event)

All lab impacts are CONTROLLED LAB IMPACT — synthetic data only. The lab contains:
• http-sim — records inbound HTTP requests without forwarding them
• exec-sim — records execution markers without running any code
• auth-sim — records auth bypass events without granting real access`,
    },
    {
      id: 'hardened',
      title: 'Hardened Variant',
      content: `A hardened variant modifies the pollution source to prevent __proto__ injection. The standard mitigation pattern:

function safeDeepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue // GUARD: skip dangerous keys
    }
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      // ... merge safely
    }
  }
}

A chain is "HARDENED_BLOCKED" when the hardened source fixture runs the same input and the lab records a HARDENED_BLOCKED event instead of PROTOTYPE_POLLUTED.`,
    },
    {
      id: 'evidence',
      title: 'Evidence Requirements',
      content: `Each chain status requires minimum evidence:

POTENTIAL: No runtime evidence required; static analysis only
REACHABLE: ≥1 GADGET_TRIGGERED event with property matching the chain
REPRODUCED: ≥1 GADGET_TRIGGERED + ≥1 IMPACT_EXECUTED event
BLOCKED: ≥1 HARDENED_BLOCKED event from the hardened fixture

Evidence records include:
• Source file and line number of the event
• Property name and origin (Object.prototype)
• Runtime event type
• Fixture version (for reproducibility)
• Timestamp`,
    },
    {
      id: 'confidence',
      title: 'Confidence Levels',
      content: `BLEED assigns a confidence level to each chain:

CONFIRMED — Multiple independent evidence items, hardened variant verified blocked, reproducible across fixture runs
HIGH — At least one REPRODUCED run; not yet hardened-verified
MEDIUM — REACHABLE but not reproduced; or only one REPRODUCED run
UNKNOWN — Static analysis only; no runtime evidence`,
    },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="text-xs font-mono text-ivory/30 uppercase tracking-widest mb-1">Reference</div>
        <h1 className="text-2xl font-bold">Research Methodology</h1>
        <p className="text-ivory/50 text-sm mt-1">How BLEED identifies, traces, reproduces, and hardens server-side prototype pollution chains.</p>
      </div>

      {/* TOC */}
      <div className="bg-surface border border-border rounded-md p-4">
        <div className="text-xs font-mono text-ivory/30 mb-3 uppercase tracking-wider">Contents</div>
        <div className="space-y-1">
          {sections.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block text-sm text-ivory/60 hover:text-ivory transition-colors font-mono"
            >
              → {s.title}
            </a>
          ))}
        </div>
      </div>

      {sections.map(s => (
        <section key={s.id} id={s.id} className="space-y-4">
          <h2 className="text-xl font-bold border-b border-border pb-2">{s.title}</h2>
          <div className="text-ivory/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {s.content.split('\n').map((line, i) => {
              if (line.startsWith('  ')) {
                return <code key={i} className="block font-mono text-xs text-ivory/60 bg-graphite/60 px-3 py-1 my-1 rounded">{line}</code>
              }
              if (line.startsWith('•')) {
                return <div key={i} className="ml-4 text-ivory/60">{line}</div>
              }
              if (line === '') return <div key={i} className="h-2" />
              return <p key={i}>{line}</p>
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
