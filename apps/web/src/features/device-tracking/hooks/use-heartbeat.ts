import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { LocationMetadata } from '@workspace/backend/types'
import { useWindowEvent } from '@/shared/hooks/use-window-event'

export type HeartbeatLocation = {
  point: { latitude: number; longitude: number }
  metadata: LocationMetadata
}

type HeartbeatOptions = {
  deviceId: undefined | Id<'devices'>
  interval?: number // in ms
  location: HeartbeatLocation | undefined
}

export function useHeartbeat(options: HeartbeatOptions) {
  const { deviceId, interval = 15000, location } = options

  const hasMounted = useRef(false)

  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const locationRef = useRef<HeartbeatLocation | undefined>(location)

  const heartbeat = useMutation(api.devices.heartbeat)
  const disconnect = useMutation(api.devices.disconnect)

  // handle deviceId change (reset session)
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (sessionTokenRef.current) {
      void disconnect({ sessionToken: sessionTokenRef.current })
    }
    setSessionToken(null)
  }, [disconnect])

  // store latest location in ref to avoid re-creating interval
  useEffect(() => {
    locationRef.current = location
  }, [location])

  // Update refs whenever tokens change.
  useEffect(() => {
    sessionTokenRef.current = sessionToken
  }, [sessionToken])

  const sendHeartbeat = useCallback(
    async (location: HeartbeatLocation | undefined) => {
      if (!deviceId) return
      console.log('🍌 sending heartbeat', deviceId, location)
      const result = await heartbeat({ deviceId, location })
      setSessionToken(result.sessionToken)
    },
    [deviceId, heartbeat],
  )

  useWindowEvent('beforeunload', () => {
    console.log('beforeunload - disconnecting')
    if (sessionTokenRef.current) {
      void disconnect({ sessionToken: sessionTokenRef.current })
    }
  })

  // periodic heartbeats
  useEffect(() => {
    // send initial heartbeat
    void sendHeartbeat(locationRef.current)
    // Clear any existing interval before setting a new one
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => sendHeartbeat(locationRef.current), interval)

    // cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (hasMounted.current && sessionTokenRef.current) {
        console.log('cleanup - disconnecting')
        void disconnect({ sessionToken: sessionTokenRef.current })
      }
    }
  }, [disconnect, interval, sendHeartbeat])

  useEffect(() => {
    hasMounted.current = true
  }, [])
}
