/**
 * Schema definitions for tracker-related data structures.
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Table to store tracking sessions for devices.
 * Each entry represents a tracking session with its status and timestamp.
 */
export const trackSession = defineTable({
  device: v.id('devices'),
  owner: v.id('users'),
  timestamp: v.number(),
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  pointsCount: v.number(),
  lastUpdatedAt: v.optional(v.number()),
})
  .index('by_device', ['device']) // get all sessions for a device
  .index('by_owner', ['owner']) // get all sessions for a user
  // these are used to query on time range and derived status (open/closed session)
  .index('by_startedAt', ['startedAt'])
  .index('by_endedAt', ['endedAt'])
  .index('active', ['device', 'endedAt'])

export const trackLocationMetadata = v.object({
  accuracy: v.optional(v.number()),
  altitude: v.optional(v.number()),
  altitudeAccuracy: v.optional(v.number()),
  heading: v.optional(v.number()),
  speed: v.optional(v.number()),
})

/**
 * Table to store geospatial metadata for tracking sessions.
 * Actual location data is stored with the geospatial component referring
 * each point to a document in this collection.
 */
export const trackLocation = defineTable({
  session: v.id('trackSession'),
  user: v.id('users'),
  // should come from the device location API / GPS information
  metadata: trackLocationMetadata,
})
  .index('by_session', ['session'])
  .index('by_user', ['user'])
