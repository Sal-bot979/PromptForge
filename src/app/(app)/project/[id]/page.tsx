import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { ArtifactGrid } from '@/components/features/ArtifactGeneration'
import { StatusChip } from '@/components/forge/StatusChip'
import { formatRelativeTime } from '@/lib/utils'
import { listStyleProfilesAction } from '@/app/(app)/styles/actions'
import type { ArtifactType, Project } from '@/types'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerClient()
  const { data } = await supabase.from('projects').select('name').eq('id', id).maybeSingle()
  return { title: data?.name ?? 'Project' }
}

/**
 * Project detail page — shows all 10 artifact cards for a project.
 *
 * Server component: loads the project and any saved artifacts from Supabase,
 * then hands them to the ArtifactGrid client component which manages generation state.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Load project — 404 if not found or doesn't belong to this user
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!project) notFound()

  // Load any previously generated artifacts
  const { data: artifacts } = await supabase
    .from('artifacts')
    .select('type, content')
    .eq('project_id', id)

  const savedArtifacts = (artifacts ?? []) as Array<{ type: ArtifactType; content: string }>

  // Load style profiles (seeds built-ins if user has none yet) + active profile pref in parallel
  const [styleResult, prefsResult] = await Promise.all([
    listStyleProfilesAction(),
    supabase
      .from('user_preferences')
      .select('active_style_profile_id')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ])
  const styleProfiles = 'data' in styleResult ? styleResult.data : []
  const activeProfileId = prefsResult.data?.active_style_profile_id ?? null

  const typedProject = project as Project

  // Build ProjectContext for prompt compilation
  const projectContext = {
    name: typedProject.name,
    description: typedProject.description,
    structuredSpec: typedProject.structured_spec,
    tags: typedProject.tags,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Project header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-forge-2xl font-bold truncate">{typedProject.name}</h1>
            {typedProject.description && (
              <p className="text-forge-sm text-[var(--color-fg-muted)] mt-1 line-clamp-2 max-w-2xl">
                {typedProject.description}
              </p>
            )}
          </div>
          <span className="text-forge-xs text-[var(--color-fg-subtle)] flex-shrink-0 pt-1">
            Updated {formatRelativeTime(typedProject.updated_at)}
          </span>
        </div>

        {/* Tags */}
        {typedProject.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {typedProject.tags.map((tag) => (
              <StatusChip key={tag} variant="default">{tag}</StatusChip>
            ))}
          </div>
        )}

        {/* Spec summary */}
        {typedProject.structured_spec && (
          <div className="mt-4 p-3 rounded-forge border border-[var(--color-border)] bg-[var(--color-surface)] max-w-3xl">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-forge-xs text-[var(--color-fg-muted)]">
              {typedProject.structured_spec.users?.length > 0 && (
                <span>
                  <span className="text-[var(--color-fg-subtle)] uppercase tracking-wide mr-1">Users</span>
                  {typedProject.structured_spec.users.slice(0, 2).join(', ')}
                  {typedProject.structured_spec.users.length > 2 && ` +${typedProject.structured_spec.users.length - 2}`}
                </span>
              )}
              {typedProject.structured_spec.tech_stack?.length > 0 && (
                <span>
                  <span className="text-[var(--color-fg-subtle)] uppercase tracking-wide mr-1">Stack</span>
                  {typedProject.structured_spec.tech_stack.slice(0, 4).join(', ')}
                  {typedProject.structured_spec.tech_stack.length > 4 && ` +${typedProject.structured_spec.tech_stack.length - 4}`}
                </span>
              )}
              {typedProject.structured_spec.deployment && (
                <span>
                  <span className="text-[var(--color-fg-subtle)] uppercase tracking-wide mr-1">Deploy</span>
                  {typedProject.structured_spec.deployment}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Artifact generation grid */}
      <ArtifactGrid
        projectContext={projectContext}
        projectId={id}
        savedArtifacts={savedArtifacts}
        profiles={styleProfiles}
        activeProfileId={activeProfileId}
      />
    </div>
  )
}
