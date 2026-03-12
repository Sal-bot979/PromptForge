import type { GenerateRequest } from '../types'
import { artifactSystemPrompts } from './systemPrompts'
import { styleInstructions } from './styleInstructions'

/**
 * The PromptCompiler: assembles the final system + user prompt for a Claude generation.
 *
 * Composition order (each layer adds specificity):
 * 1. Artifact-type system prompt (defines what to produce)
 * 2. Style instructions (how to write it)
 * 3. User's learned overrides (fine-grained style corrections)
 * 4. Injected snippets (team conventions, reusable blocks)
 * 5. Project context (what we're building)
 *
 * Keeping each layer separate means we can tune any one independently.
 */
export function compilePrompt(request: GenerateRequest): { systemPrompt: string; userPrompt: string } {
  const { artifactType, projectContext, styleProfile, snippets } = request

  const artifactSystemPrompt = artifactSystemPrompts[artifactType]
  const styleInstruction = styleInstructions[styleProfile.styleType]

  // Build the system prompt by layering concerns
  const systemParts: string[] = [
    artifactSystemPrompt,
    '',
    '## Output Style',
    styleInstruction,
  ]

  // Append custom style rules from the user's profile
  if (styleProfile.rules.length > 0) {
    systemParts.push('', '## Additional Style Rules')
    styleProfile.rules.forEach((rule) => systemParts.push(`- ${rule}`))
  }

  // Append learned overrides (patterns the user has consistently corrected)
  if (styleProfile.learnedOverrides.length > 0) {
    systemParts.push('', '## Learned Preferences')
    systemParts.push('Apply these corrections that this user has previously made:')
    styleProfile.learnedOverrides.forEach(({ pattern, replacement }) => {
      systemParts.push(`- Instead of "${pattern}", write "${replacement}"`)
    })
  }

  // Inject snippets that matched the project's trigger keywords
  if (snippets.length > 0) {
    systemParts.push('', '## Injected Conventions')
    systemParts.push('Include these user-defined conventions where relevant:')
    snippets.forEach(({ name, content }) => {
      systemParts.push(`\n### ${name}\n${content}`)
    })
  }

  const systemPrompt = systemParts.join('\n')

  // Build the user prompt with project context
  const userParts: string[] = [
    '# Project Context',
    '',
    `**Name:** ${projectContext.name}`,
    '',
    `**Description:**\n${projectContext.description}`,
  ]

  if (projectContext.structuredSpec) {
    const spec = projectContext.structuredSpec
    userParts.push('', '**Structured Specification:**')
    if (spec.concept) userParts.push(`- Concept: ${spec.concept}`)
    if (spec.users.length > 0) userParts.push(`- Target Users: ${spec.users.join(', ')}`)
    if (spec.goals.length > 0) userParts.push(`- Goals: ${spec.goals.join('; ')}`)
    if (spec.constraints.length > 0) userParts.push(`- Constraints: ${spec.constraints.join('; ')}`)
    if (spec.tech_stack.length > 0) userParts.push(`- Tech Stack: ${spec.tech_stack.join(', ')}`)
    if (spec.deployment) userParts.push(`- Deployment: ${spec.deployment}`)
  }

  if (projectContext.tags.length > 0) {
    userParts.push(`\n**Tags:** ${projectContext.tags.join(', ')}`)
  }

  userParts.push('', '---', '', 'Generate the artifact now. Output only the document content — no preamble, no explanation.')

  const userPrompt = userParts.join('\n')

  return { systemPrompt, userPrompt }
}
