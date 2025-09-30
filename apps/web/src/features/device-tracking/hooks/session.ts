'use client'

import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useMutation, useQuery } from 'convex/react'

/**
 * Get the currently active session for a given device, if it exists.
 */
export function useActiveSession(deviceId: Id<'devices'> | undefined) {
  return useQuery(api.tracking.sessions.getActive, { deviceId })
}

export function useStartSession() {
  return useMutation(api.tracking.sessions.start)
}

export function useStopSession() {
  return useMutation(api.tracking.sessions.stop)
}

export function useSendPosition() {
  return useMutation(api.tracking.locations.add)
}
