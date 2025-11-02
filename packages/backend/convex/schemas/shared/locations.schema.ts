/**
 * internal shared schemas for location data.
 * these are used by devices and active sessions to store location metadata
 * if provided by devices.
 */

import { v } from 'convex/values'

/**
 * This object represent metadata for a (GPS) location.
 * Everything in here is optional since devices might not be able to provide
 * all the information, depending on the type of device, OS, permissions,
 * and other factors.
 */
export const locationMetadata = v.object({
  accuracy: v.optional(v.number()),
  altitude: v.optional(v.number()),
  altitudeAccuracy: v.optional(v.number()),
  heading: v.optional(v.number()),
  speed: v.optional(v.number()),
})
