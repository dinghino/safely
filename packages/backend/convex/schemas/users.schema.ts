import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const users = defineTable({
  name: v.string(),
  external_id: v.string(),
  // todo: make required later
  image: v.optional(v.string()),
  username: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
})
  .index('by_external_id', ['external_id'])
  .index('by_username', ['username'])
