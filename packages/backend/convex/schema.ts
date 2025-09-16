import { defineSchema } from 'convex/server'
import { todos, users } from './schemas'

export default defineSchema({
  // Other tables here...
  users,
  todos,
})
