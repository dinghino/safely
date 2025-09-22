/// derp derp temporary but functional geolocation helper
// this should be its own state machine provided as actor to the session manager
// so we can have one source of thruth for location data and manage watchPosition etc.

import { transformPosition } from '@/entities/session/lib'
import type { LocationMetadata } from '@workspace/backend/types'

type PositionData = {
  point: { latitude: number; longitude: number }
  metadata: LocationMetadata
}

function throwAfter(ms: number, reject: (reason?: any) => void) {
  return setTimeout(() => {
    reject(new Error(`Geolocation request timed out after ${ms}ms`))
  }, ms)
}

export async function getPosition(options: PositionOptions) {
  console.log('[xstate] Getting position with options', options)
  return new Promise<PositionData>((resolve, reject) => {
    // let timeoutId: NodeJS.Timeout
    const handleSuccess = (position: GeolocationPosition) => {
      // if (timeoutId) clearTimeout(timeoutId)
      console.log('[xstate] Got position', position)
      const data = transformPosition(position)
      resolve(data)
    }
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported'))
    }
    // timeoutId = throwAfter(5_000, reject) // default timeout of 5s
    navigator.geolocation.getCurrentPosition(handleSuccess, reject, {
      enableHighAccuracy: true,
      ...options,
    })
  })
}

export async function watchPosition(
  options: PositionOptions,
  // callback: (data: LocationData) => void,
) {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported')
  }
  return new Promise<PositionData>((resolve, reject) => {
    const onSuccess = (position: GeolocationPosition) => {
      const data = transformPosition(position)
      resolve(data)
    }

    const onError = (error: GeolocationPositionError) => {
      reject(error.message)
    }

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      ...options,
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  })
}
