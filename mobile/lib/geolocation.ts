/**
 * @file geolocation.ts
 * @description Utility functions to adapt I/O between `react-native-background-geolocation`
 * and our backend geolocation expectations.
 */

import BackgroundGeolocation from 'react-native-background-geolocation'
import type {
  Location,
  Config,
  LocationAccuracy,
  CurrentPositionRequest,
} from 'react-native-background-geolocation'
import type { Device, LocationMetadata } from '@workspace/backend/types'

type LocationData = {
  point: { latitude: number; longitude: number }
  metadata: LocationMetadata
  timestamp: number
}

/**
 * Transforms a `react-native-background-geolocation` Location object into
 * a `LocationData` object that our server expects.
 */
export const transformLocation = (location: Location): LocationData => {
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
  } satisfies LocationData
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

  if (!requested) return BackgroundGeolocation.DESIRED_ACCURACY_LOW
  return accuracyMap[requested]
}

/**
 * Maps the accuracy enum from the backend to the distanceFilter constants of
 * `react-native-background-geolocation`
 * @returns distanceFilter in meters
 */
function getDistanceFilter(requested: ServerAccuracy | undefined): number {
  const distanceMap = {
    HIGH: 10,
    MEDIUM: 25,
    LOW: 50,
    VERY_LOW: 200,
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

  const { accuracy } = settings.location
  /**
   * BackgroundGeolocation docs says that we CANNOT have a location heartbeat
   * interval lower than 60 seconds, enforced by the OS, so we minmax it here.
   */
  const heartbeatInterval = Math.max(settings.heartbeat.interval / 1000, 60) // seconds
  return {
    heartbeatInterval,
    desiredAccuracy: getAccuracy(accuracy),
    // locationUpdateInterval: Math.max(settings.location.timeout / 2, 30), // seconds
    distanceFilter: getDistanceFilter(accuracy),
  }
}

/**
 * Transforms the options passed to `getCurrentPosition` into something
 * `react-native-background-geolocation` can digest.
 * @see {@link transformSettings} for more information as it is similar.
 */
export function transformGetLocationOptions(
  settings: Device['settings'] | null | undefined,
  options: Partial<CurrentPositionRequest> = {},
): CurrentPositionRequest {
  if (!settings) return options

  const { timeout, accuracy, maximumAge = 10 * 60 * 1000 } = settings.location
  return {
    ...options,
    desiredAccuracy: getAccuracy(accuracy),
    timeout: timeout / 1000,
    maximumAge,
  }
}
