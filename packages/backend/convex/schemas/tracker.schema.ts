/**
 * Schema definitions for tracker-related data structures.
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
// import { trackingRequestType, trackingRequestStatus } from './enums'

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
  // todo: these can be either received or evaluated on the server if missing
  // using the previous point and timestamp to calculate speed (and heading)
  // if the current meta don't have them but previous do.
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

/**
 * Tracking requests between devices.
 * A request is for now an ephemeral object that is created when a device wants
 * to start tracking another device (or itself) and deleted when the target
 * receives the requests and acknowledges it, by starting a new tracking session.
 *
 * @todo use the status and acknowledged fields to manage the request lifecycle.
 * For now there is no logic to disregard a request, so any time one is created
 * and the target sees it, it starts a new session by default.
 *
 * In the future we'll want to add the ability to deny or ignore a request for
 * a variety of reasons and keep track of the request status.
 */
export const trackRequests = defineTable({
  sender: v.id('devices'), // device sending the request
  target: v.id('devices'), // device to be tracked
  owner: v.id('users'), // user owning the target device
  // status: trackingRequestStatus,
  // // for future use - if the target device has seen the request
  acknowledged: v.boolean(),
  // // set once the session is created from the target
  session: v.union(v.id('trackSession'), v.null()),
  // // for future use to request start and stop events (which target may disregard)
  // type: v.optional(trackingRequestType),
})
  // get requests for a target device
  .index('target', ['target'])
  .index('acknowledged', ['target', 'acknowledged'])
// index for request type
// .index('type', ['type'])
// .index('status', ['status']) // get requests by status
// .index('session', ['session']) // get request by session
