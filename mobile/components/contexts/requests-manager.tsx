import { useCallback, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'

import { useDeviceContext } from './device-manager'
import {
  isRequestPending,
  isRequestValid,
  type TrackingRequest,
} from '@/lib/shared/request-helpers'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { useSessionToken } from '@/lib/hooks/auth-hooks'

/**
 * Pure business logic component that listens for incoming requests from the server
 * and decides how to handle them.
 * @note this is a placeholder component for now as we'll be most likely using
 * notifications and background tasks to handle requests from the server.
 */
export const RequestsManager = () => {
  const { device } = useDeviceContext()
  const request = useQuery(api.tracking.requests.getOpen, { target: device?._id })
  const acknowledge = useAcknowledgeRequest()

  useEffect(() => {
    if (!request || !device) return
    // auto acknowledge the request if the request is from the current user
    if (!isRequestValid({ request, device }))
      return console.warn(
        'Invalid request received. only user owning the device can make requests',
        request,
      )

    acknowledge(request)
      .then(() => console.log('Request acknowledged', request))
      .catch(console.error)
  }, [request, device, acknowledge])

  return null
}

function useAcknowledgeRequest() {
  const acknowledge = useMutation(api.tracking.requests.acknowledge)
  const [sessionToken] = useSessionToken()

  return useCallback(
    async (request: TrackingRequest) => {
      if (!hasSessionToken(sessionToken)) {
        return console.error('No session token available to acknowledge request')
      }
      if (!isRequestPending(request)) {
        return console.error('No valid request provided to acknowledge')
      }

      // get current state from bgl
      const state = await BackgroundGeolocation.getState()
      switch (request.type) {
        // if we need to start we need to ensure that the geolocation service
        // is running and can run, then we can start the `activity` (see docs of `changePace`)
        case 'start':
          await handleStartSession(state)
          break
        // if we need to stop we just stop the `activity` but keep the service running
        // for heartbeats and future requests.
        case 'stop':
          await handleStopSession(state)
          break
        default:
          throw new Error('Invalid request type')
      }

      return acknowledge({ requestId: request._id, sessionToken })
    },
    [acknowledge, sessionToken],
  )
}

async function handleStartSession(state: { enabled: boolean }) {
  if (!state.enabled) {
    const { enabled } = await BackgroundGeolocation.start()
    if (!enabled) throw new Error('Failed to start background geolocation')
  }
  await BackgroundGeolocation.changePace(true)
}
async function handleStopSession(state: { enabled: boolean }) {
  if (!state.enabled) return // already stopped
  await BackgroundGeolocation.changePace(false)
}

function hasSessionToken<T>(token: T | null | undefined): token is T {
  return !!token
}
