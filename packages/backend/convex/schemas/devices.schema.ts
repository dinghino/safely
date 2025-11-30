import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { deviceStatus, trackingMode, gpsAccuracy, deviceType } from './enums'
import { locationMetadata } from '../schemas/shared'
import { deviceActivities } from './device-activities.schema'

/**
 * registered devices for a user
 */
export const devices = defineTable({
  owner: v.id('users'),
  name: v.optional(v.string()),
  // deviceId: v.string(),
  last_seen: v.number(),
  platform: v.optional(v.string()),
  status: deviceStatus,
  type: deviceType,
  mode: trackingMode,
})
  .index('by_owner', ['owner'])
  // .index('by_deviceId', ['deviceId'])
  .index('by_last_seen', ['last_seen'])
  .index('by_status', ['status'])

// region device sessions
/**
 * Collection to keep track of sessions association with
 * devices.
 */
export const deviceSessions = defineTable({
  deviceId: v.id('devices'),
  // sessionId: v.string(),
  // todo: add session metadata, e.g. expiration, use count, etc to
  // allow session management, like invalidation, refresh etc.
}).index('deviceId', ['deviceId'])
// .index('sessionId', ['sessionId'])

/**
 * Track active session timeouts to allow cancelling scheduled disconnects
 */
export const deviceSessionTimeouts = defineTable({
  sessionId: v.string(),
  scheduledFunctionId: v.id('_scheduled_functions'),
}).index('sessionId', ['sessionId'])

/**
 * Link session tokens to sessions, allowing a disconnect
 * between the two entities but linking a session token with
 * a device
 */
export const deviceSessionTokens = defineTable({
  token: v.string(),
  sessionId: v.id('deviceSessions'), // todo: Id<'deviceSessions'>
  // // for future use, so we can mark tokens as revoked/invalidated and have
  // // a history and revalidation mechanism
  // expired: v.optional(v.number()), // timestamp

  // todo: add expiration and token validity metadata?
  // todo: add deviceId for easier querying?
})
  .index('token', ['token'])
  .index('sessionId', ['sessionId'])

// ----------------------------------------------------------------------------
// placeholder for device options and settings
// ----------------------------------------------------------------------------

// region device options

export const locatorOptions = v.object({
  // options: v.object({
  // ms - mobile needs * 1000 as service uses seconds
  timeout: v.number(),
  maximumAge: v.number(),
  accuracy: gpsAccuracy,
  // }),
})
export const heartbeatOptions = v.object({
  interval: v.number(), // ms
})
/**
 * Table containing the default values for device options, assigned
 * when a device is created.
 * These can be overridden per device in the deviceOptions table.
 */
export const defaultDeviceSettings = defineTable({
  key: v.object({ type: deviceType, mode: trackingMode }),
  ...locatorOptions.fields,
})
  .index('key', ['key'])
  .index('type', ['key.type'])

/**
 * Table containing device-specific options, overriding the defaults
 * from the defaultOptions table.
 */
export const deviceOptions = defineTable({
  deviceId: v.id('devices'),
  mode: trackingMode,
  location: locatorOptions,
  heartbeat: heartbeatOptions,
}).index('device_mode', ['deviceId', 'mode'])

export const deviceLocations = defineTable({
  deviceId: v.id('devices'),
  metadata: locationMetadata,
}).index('device', ['deviceId'])

/**
 * Device activity logs, for activity feed, auditing and debugging purposes.
 */
export const deviceActivitiesLog = defineTable(deviceActivities)
  .index('device', ['deviceId'])
  .index('timestamp', ['timestamp'])
  .index('type', ['type'])

/*
type LocationOptions = {
  timeout?: number // ms - mobile needs * 1000 as service uses seconds
  maximumAge?: number // ms
  // sets enableHighAccuracy on navigator.geolocation or determines accuracy level
  // on react-native-background-geolocation
  // this should also determine samples, desiredAccuracy and other factors on the
  // client app
  accuracy?: Accuracy
}

type Plugin = {
  timeout: 30 // 30 second timeout to fetch location
  persist: true // Defaults to state.enabled
  maximumAge: 5000 // Accept the last-known-location if not older than 5000 ms.
  // config.stationaryRadius - no desired accuracy but actual distance
  desiredAccuracy: 10 // Try to fetch a location with an accuracy of `10` meters.
  samples: 3 // How many location samples to attempt.
  // Custom meta-data.
  extras: { route_id: 123 }
}

type navigatorGeolocator = {
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

type Accuracy = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' // high = gps w/ metadata
*/
