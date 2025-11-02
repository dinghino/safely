'use client'

import { useDeviceContext } from '@/features/device-manager'
import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { useCallback } from 'react'

/**
 * Get the currently active session for a given device, if it exists.
 */
export function useActiveSession(deviceId: Id<'devices'> | undefined) {
  return useQuery(api.tracking.sessions.getActive, { deviceId })
}

export function useSession(sessionId: Id<'trackSession'>) {
  return useQuery(api.tracking.sessions.get, { sessionId })
}
/**
 * Get all sessions for a given device.
 * @todo add options for pagination, filtering, sorting and grouping
 */
export function useAllSessions(deviceId: Id<'devices'> | undefined, _options = {}) {
  return useQuery(api.tracking.sessions.getAllOfDevice, { deviceId })
}

export function useSessionData(sessionId: Id<'trackSession'>) {
  return useQuery(api.tracking.locations.getSession, { sessionId })
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

// ----------------------------------------------------------------------------
// region requests

/**
 * Get a function to create a new tracking request to a target device with
 * the current device as the requester.
 */
export function useCreateRequest() {
  const { device: thisDevice } = useDeviceContext()

  const makeRequest = useMutation(api.tracking.requests.create)

  type Args = Omit<Parameters<typeof makeRequest>[0], 'from'>

  return useCallback(
    async (opts: Args) => {
      if (!opts.target) return null // early return if no target
      if (!thisDevice?._id)
        throw new Error('This device is not registered and cannot make requests')

      return makeRequest({ ...opts, from: thisDevice._id })
    },
    [thisDevice?._id, makeRequest],
  )
}

export function useRemoveRequest() {
  return useMutation(api.tracking.requests.remove)
}

export function useActiveRequest(opts: { deviceId: Id<'devices'> | undefined }) {
  const { deviceId } = opts
  return useQuery(api.tracking.requests.getOpen, { target: deviceId })
}

export function useAcknowledgeRequest() {
  return useMutation(api.tracking.requests.acknowledge)
}
