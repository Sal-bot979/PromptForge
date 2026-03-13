'use client'

import * as React from 'react'
import { useStyleStore } from '@/store/styleStore'
import type { StyleProfile } from '@/types'

interface StyleStoreInitializerProps {
  profiles: StyleProfile[]
  activeProfileId: string | null
}

/**
 * Client shim that hydrates the styleStore from server-loaded data.
 *
 * Renders nothing. Must be placed inside the component tree before any
 * component that reads from styleStore (e.g. StyleSelector, ArtifactGrid).
 *
 * Re-initializes whenever the projectId or profiles list changes to handle
 * navigation between projects without a full page reload.
 */
export function StyleStoreInitializer({ profiles, activeProfileId }: StyleStoreInitializerProps) {
  const initProfiles = useStyleStore((s) => s.initProfiles)

  React.useEffect(() => {
    initProfiles(profiles, activeProfileId)
  }, [profiles, activeProfileId, initProfiles])

  return null
}
