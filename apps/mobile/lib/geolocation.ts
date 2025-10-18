import type { Geolocator } from '@workspace/heartbeat/types'

import BackgroundGeolocation from 'react-native-background-geolocation'
import type { Device } from '@workspace/backend/types'
import type {
  Location,
  Config,
  LocationAccuracy,
  CurrentPositionRequest,
} from 'react-native-background-geolocation'
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

type ServerAccuracy = Device['settings']['location']['accuracy']

/**
 * Maps the accuracy enum from the backend to the accuracy constants of
 * `react-native-background-geolocation`
 */
function getAccuracy(requested: ServerAccuracy | undefined): LocationAccuracy {
  const accuracyMap = {
    HIGH: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    MEDIUM: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
    LOW: BackgroundGeolocation.DESIRED_ACCURACY_LOW,
    VERY_LOW: BackgroundGeolocation.DESIRED_ACCURACY_LOWEST,
  } satisfies Record<ServerAccuracy, LocationAccuracy>

  if (!requested) return BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM
  return accuracyMap[requested]
}

function getDistanceFilter(requested: ServerAccuracy | undefined): number {
  const distanceMap = {
    HIGH: 10, // meters
    MEDIUM: 50,
    LOW: 200,
    VERY_LOW: 1000,
  }
  if (!requested) return 50
  return distanceMap[requested]
}

/**
 * Transforms a device settings object into something `react-native-background-geolocation`
 * can digest as configuration.
 * @note we only transform the settings relevant to location tracking here,
 * any other configuration parameters should be set when passing the object to
 * `BackgroundGeolocation.ready()` or `BackgroundGeolocation.setConfig()`
 * @returns empty object if we don't have device settings or a mergeable config object
 * for `react-native-background-geolocation`
 */
export function transformSettings(settings: Device['settings'] | undefined): Config {
  if (!settings) return {}

  const { accuracy, timeout } = settings.location
  /**
   * BackgroundGeolocation docs says that we CANNOT have a location heartbeat
   * interval lower than 60 seconds, enforced by the OS, so we minmax it here.
   */
  const heartbeatInterval = Math.max(settings.heartbeat.interval / 1000, 60) // seconds
  return {
    desiredAccuracy: getAccuracy(accuracy),
    fastestLocationUpdateInterval: timeout / 2,
    heartbeatInterval,
    distanceFilter: getDistanceFilter(accuracy),
  }
}

/**
 * Transforms the options passed to `getCurrentPosition` into something
 * `react-native-background-geolocation` can digest.
 * @see {@link transformSettings} for more information as it is similar.
 */
export function transformGetLocationOptions(
  options: Partial<CurrentPositionRequest> | undefined,
  device: Device | null | undefined,
): CurrentPositionRequest {
  if (!device) return {}

  const { timeout, accuracy, maximumAge = 10 * 60 * 1000 } = device.settings.location
  return {
    ...options,
    desiredAccuracy: getAccuracy(accuracy),
    timeout: timeout / 1000,
    maximumAge,
  }
}
