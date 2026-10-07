import type { ResearchRun } from '@bleed/shared'

export function exportRunToJson(run: ResearchRun): string {
  return JSON.stringify(run, null, 2)
}

export function exportRunToMarkdown(run: ResearchRun): string {
  const lines: string[] = [
    `# Research Run: ${run.id}`,
    ``,
    `**Scenario:** ${run.scenarioId}  `,
    `**Fixture:** ${run.fixtureId} @ ${run.fixtureVersion}  `,
    `**Result:** ${run.result}  `,
    `**Mitigation State:** ${run.mitigationState}  `,
    `**Duration:** ${run.duration}ms  `,
    `**Timestamp:** ${new Date(run.timestamp).toISOString()}`,
    ``,
    `## Chain`,
    ``,
    `**Name:** ${run.chain.name}  `,
    `**Status:** ${run.chain.status}  `,
    `**Confidence:** ${run.chain.confidence}  `,
    `**Impact:** ${run.chain.impact}`,
    ``,
    `## Events (${run.events.length})`,
    ``,
  ]

  for (const event of run.events) {
    lines.push(`- \`+${event.relativeMs}ms\` **${event.type}**: ${event.description}`)
  }

  if (run.notes.length > 0) {
    lines.push(``, `## Notes`, ``)
    for (const note of run.notes) {
      lines.push(`- ${note.content}`)
    }
  }

  return lines.join('\n')
}
