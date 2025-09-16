import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineTable({
  name: v.string(),
  external_id: v.string(),
}).index('by_external_id', ['external_id'])
