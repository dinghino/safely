import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { trackingMode } from './enums'

/**
 * define (static) configuration for device tracking features.
 * These values should be static and only changed through:
 * - app updates
 * - server migrations
 * - A/B testing framework
 * - super admin through dashboard (late future)
 *
 * Keeping these static should allow convex to cache the values and reduce
 * reads and usage.
 */
export const appSettings = defineTable({
  device: v.object({
    heartbeatIntervalMs: v.number(),
  }),
  tracking: v.object({
    intervalMs: v.record(v.string(), v.number()),
  }),
})

/**
 * Table representing device-specific settings and status, and is used by
 * the device to determine how to behave.
 *
 * Values in this table can be changed:
 * - by the user in the app through manual inputs (i.e. tracking session)
 * - by the server through rules (i.e. geofences)
 * - by the server through automation (i.e. low battery)
 */
export const deviceSettings = defineTable({
  deviceId: v.id('devices'),
  trackingMode,
  updateIntervalMs: v.number(),
  heartbeatIntervalMs: v.optional(v.number()),
}).index('by_deviceId', ['deviceId'])
