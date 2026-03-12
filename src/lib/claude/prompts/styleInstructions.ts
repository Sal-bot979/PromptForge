import type { StyleType } from '@/types'

/**
 * Style-specific instructions injected into every generation's system prompt.
 *
 * These instructions tell Claude HOW to write, not WHAT to write.
 * The artifact system prompt handles the content; the style layer handles the form.
 */
export const styleInstructions: Record<StyleType, string> = {
  structured: `Write in a structured format:
- Use numbered lists for all sequences (steps, phases, priorities)
- Use bullet points for non-sequential items
- Use tables for comparisons, specs, and data with multiple attributes
- Use headers (## and ###) to clearly delineate every section
- Use checkboxes (- [ ]) for action items and criteria
- Code examples should be in fenced code blocks with language identifiers
- Bold (**) key terms on first use and for critical warnings
- Keep paragraphs short (3-4 sentences max)
- Every section should begin with a clear summary sentence`,

  narrative: `Write in a narrative, prose-driven format:
- Lead with context and reasoning before conclusions
- Use full paragraphs instead of bullet points where possible
- Tell the story of why decisions were made, not just what they are
- Use section headers sparingly — let the prose carry the structure
- Explain trade-offs conversationally ("We chose X because... The downside is... We mitigate this by...")
- Reserve bullet points for genuinely list-like information (enumerations, code, commands)
- Write as if explaining to a smart colleague, not filling out a form
- Each section should flow naturally into the next`,

  terse: `Write in a terse, dense format:
- Use as few words as possible while preserving all critical information
- Prefer imperative form: "Use X" not "You should consider using X"
- No preamble, no transitions, no pleasantries
- Use nested bullets for hierarchy, flat lists for sequences
- Omit "Introduction", "Overview", and "Conclusion" sections unless essential
- Every sentence must carry information — no filler
- Use abbreviations and technical shorthand freely (the reader is an expert)
- Tables and code blocks are preferred over prose explanations
- If something is obvious from context, omit it`,

  custom: `Apply the user's custom style rules defined above. If no custom rules are defined, default to the structured style.`,
}
