import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const deviceStatus = v.union(
  v.literal('online'),
  v.literal('idle'),
  v.literal('offline'),
  v.literal('unknown'),
)

export default defineTable({
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
