'use client'

import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useMutation, useQuery } from 'convex/react'

/**
 * Get the active session for a device if it exists
 */
export function useActiveSession(deviceId: Id<'devices'> | undefined) {
  return useQuery(api.tracking.getActiveSession, { deviceId })
}
export function useStartSession() {
  const mutation = useMutation(api.tracking.startSession)
  return async (device: { _id: Id<'devices'> }) => {
    await mutation({ deviceId: device._id })
  }
}

export function useStopSession() {
  const mutation = useMutation(api.tracking.stopSession)
  return async (session: { _id: Id<'trackSession'> }) => {
    await mutation({ sessionId: session._id })
  }
}
