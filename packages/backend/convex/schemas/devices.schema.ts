import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineTable({
  owner: v.id('users'),
  name: v.optional(v.string()),
  deviceId: v.string(),
  last_seen: v.number(),
  platform: v.optional(v.string()),
})
.index('by_owner', ['owner']).index('by_deviceId', ['deviceId'])
