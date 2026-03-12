import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import type { Project } from '@/types'
import { ForgeCard, ForgeCardHeader, ForgeCardTitle, ForgeCardDescription, ForgeCardFooter } from '@/components/forge/ForgeCard'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { StatusChip } from '@/components/forge/StatusChip'
import { formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, artifacts(count)')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  if (error) {
    // Log full error in development, show generic message to user
    if (process.env.NODE_ENV === 'development') {
      console.error('[DashboardPage] Failed to load projects:', error)
    }
  }

  const projectList = (projects as Project[] | null) ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-forge-2xl font-bold">Projects</h1>
          <p className="text-forge-sm text-[var(--color-fg-muted)] mt-1">
            {projectList.length === 0
              ? 'Create your first project to get started'
              : `${projectList.length} project${projectList.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <ForgeButton variant="primary">New Project</ForgeButton>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-forge border border-[var(--color-error)]/30 bg-red-950/20">
          <p className="text-forge-sm text-[var(--color-error)]">
            Something went wrong loading your projects. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {projectList.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-forge-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[var(--color-fg-subtle)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-forge-lg font-semibold mb-2">No projects yet</h2>
          <p className="text-forge-sm text-[var(--color-fg-muted)] max-w-sm mb-6">
            Describe a project once. PromptForge generates your PRD, architecture spec, Claude Code
            kickoff prompt, and more.
          </p>
          <ForgeButton variant="primary" size="lg">
            Create your first project
          </ForgeButton>
        </div>
      )}

      {/* Project grid */}
      {projectList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const artifactCount = 0 // Will be populated with real count in Phase 3

  return (
    <ForgeCard interactive className="flex flex-col">
      <ForgeCardHeader>
        <ForgeCardTitle className="line-clamp-1">{project.name}</ForgeCardTitle>
        {artifactCount > 0 && (
          <StatusChip variant="accent">{artifactCount} artifacts</StatusChip>
        )}
      </ForgeCardHeader>

      {project.description && (
        <ForgeCardDescription className="line-clamp-2 flex-1">
          {project.description}
        </ForgeCardDescription>
      )}

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tags.slice(0, 3).map((tag) => (
            <StatusChip key={tag} variant="default">
              {tag}
            </StatusChip>
          ))}
          {project.tags.length > 3 && (
            <StatusChip variant="default">+{project.tags.length - 3}</StatusChip>
          )}
        </div>
      )}

      <ForgeCardFooter>
        <span className="text-forge-xs text-[var(--color-fg-subtle)]">
          {formatRelativeTime(project.updated_at)}
        </span>
      </ForgeCardFooter>
    </ForgeCard>
  )
}
