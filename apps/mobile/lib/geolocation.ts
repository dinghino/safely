import type { Geolocator } from '@workspace/heartbeat/types'

import type { Location } from 'react-native-background-geolocation'

/**
 * Transforms a `react-native-background-geolocation` Location object into
 * a `Geolocator.Data` object that our server expects.
 * @note `Geolocator.Data` is an alias for `Locator.Data` from `@workspace/geolocation`
 */
export const transformLocation = (location: Location): Geolocator.Data => {
  return {
    point: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
    metadata: {
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      speed: location.coords.speed,
      heading: location.coords.heading,
    },
    timestamp: Date.parse(location.timestamp),
  } satisfies Geolocator.Data
}
