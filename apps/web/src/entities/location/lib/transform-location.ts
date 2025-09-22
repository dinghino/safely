import type { LocationData } from '../types'

export const transformPosition = (position: GeolocationPosition): LocationData => {
  return {
    point: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },
    metadata: {
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
    },
  }
}
