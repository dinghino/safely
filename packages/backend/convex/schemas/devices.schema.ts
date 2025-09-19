import { defineTable } from 'convex/server'
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

export const devices = defineTable({
  owner: v.id('users'),
  name: v.optional(v.string()),
  deviceId: v.string(),
  last_seen: v.number(),
  platform: v.optional(v.string()),
  status: deviceStatus,
})
  .index('by_owner', ['owner'])
  .index('by_deviceId', ['deviceId'])
  .index('by_last_seen', ['last_seen'])
  .index('by_status', ['status'])

/**
 * track active sessions for a device.
 */
export const deviceSessions = defineTable({
  deviceId: v.id('devices'),
  sessionId: v.string(),
})
  .index('deviceId', ['deviceId'])
  .index('sessionId', ['sessionId'])

export const deviceSessionTimeouts = defineTable({
  sessionId: v.string(),
  scheduledFunctionId: v.id('_scheduled_functions'),
}).index('sessionId', ['sessionId'])

export const deviceSessionTokens = defineTable({
  token: v.string(),
  sessionId: v.string(),
})
  .index('token', ['token'])
  .index('sessionId', ['sessionId'])
