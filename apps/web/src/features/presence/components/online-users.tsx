'use client'

import { FacePile } from '@workspace/backend/react'
import { useUserPresenceContext } from '@/features/presence/contexts'
import { cn } from '@/lib/utils'

/**
 * Shows online users as a face pile.
 * @todo either refactor db side or make custom visualization to show things
 *       properly
 */
export function OnlineUsersList({ className }: { className?: string }) {
  const { state } = useUserPresenceContext()
  if (!state) return null
  return (
    <div className={cn("px-2 py-4", className)}>
      <FacePile presenceState={state} />
    </div>
  )
}
