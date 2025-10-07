/**
 * Seed data mutations
 * These are run manually as needed to populate or update data
 * in the database.
 */
import { internalMutation } from './_generated/server'
import { deviceOptions } from './seeds/devices'

const all = internalMutation({
  args: {
    // No arguments for now. we may want to add stuff later
  },
  handler: async (ctx) => {
    await deviceOptions(ctx)
  },
})

export const devices = internalMutation({
  handler: async (ctx) => await deviceOptions(ctx),
})

export default all
