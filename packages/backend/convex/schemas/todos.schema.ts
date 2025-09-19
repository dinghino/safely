/** @format */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const todos = defineTable({
  completed: v.boolean(),
  text: v.string(),
  created_by: v.id('users'),
})
  .index('byCreatedBy', ['created_by'])
  .index('byCompleted', ['completed'])
