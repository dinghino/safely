import { v } from 'convex/values'

export const deviceType = v.union(v.literal('unknown'), v.literal('mobile'), v.literal('desktop'))

/**
 * General status of a device
 */
export const deviceStatus = v.union(
  v.literal('online'), // inside heartbeat interval
  v.literal('idle'), // not used for now
  v.literal('active'), // active tracking session - not used for now
  v.literal('offline'), // outside heartbeat interval
  v.literal('unknown'), // never reported
)

/**
 * defines how frequently a device should send its position.
 * At the app level this will be translated into update timeouts, accuracy,
 * and other parameters.
 * @todo since we are splitting heartbeat from tracking updates, we might want
 * to split and/or have these modes be more fine-grained and different for each
 * feature.
 */
export const trackingMode = v.union(
  // do not send data besides heartbeats maybe.
  // This should never be actually used unless for disabling tracking on
  // on static devices (i.e. desktop PCs and such).
  // devices should still send heartbeats with optional position data if available
  // but not actively try to get location updates.
  v.literal('off'),
  // send data infrequently, e.g. every 15 minutes
  v.literal('passive'),
  // send data actively, e.g. every 3 minutes
  v.literal('active'),
  // send data aggressively, e.g. every 10 seconds
  v.literal('aggressive'),
)

/**
 * Status of a tracking request between devices. used to filter, log history
 * and manage a request lifecycle.
 * @todo implement in the tracking requests logic - for now they are ephemeral
 */
export const trackingRequestStatus = v.union(
  v.literal('pending'), // request sent, waiting for target device to approve
  v.literal('approved'), // target device approved, waiting for session to start
  v.literal('denied'), // target device or server denied the request
  v.literal('expired'), // request expired without response
  v.literal('canceled'), // sender canceled the request before acknowledgment
)

export const trackingRequestType = v.union(v.literal('start'), v.literal('stop'))

export const gpsAccuracy = v.union(
  v.literal('VERY_LOW'),
  v.literal('LOW'),
  v.literal('MEDIUM'),
  v.literal('HIGH'),
)
