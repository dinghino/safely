import { v } from 'convex/values'

/**
 * General status of a device
 */
export const deviceStatus = v.union(
  v.literal('online'),
  v.literal('idle'),
  v.literal('offline'),
  v.literal('unknown'),
)


/**
 * defines how frequently a device should send its position.
 * At the app level this will be translated into update timeouts, accuracy,
 * and other parameters.
 */
export const trackingMode = v.union(
  // do not send data besides heartbeats maybe.
  // This should never be actually used unless for disabling tracking on
  // on static devices (i.e. desktop PCs and such)
  v.literal('off'),
  // send data infrequently, e.g. every 15 minutes
  v.literal('passive'),
  // send data actively, e.g. every 3 minutes
  v.literal('active'),
  // send data aggressively, e.g. every 10 seconds
  v.literal('aggressive'),
)
