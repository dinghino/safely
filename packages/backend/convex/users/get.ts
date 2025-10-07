import { query } from '../_generated/server'
import { getCurrentUser } from '../lib/auth'

export const current = query({
  handler: async (ctx) => await getCurrentUser(ctx),
})
