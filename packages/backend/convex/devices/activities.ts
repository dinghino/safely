import { v } from 'convex/values'
import { internalMutation, query } from '../_generated/server'
import { deviceActivityEvent } from '../schemas/device-activities.schema'
import { isCurrentUserOwner } from '../lib/devices'

export const add = internalMutation({
  args: {
    data: deviceActivityEvent,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('deviceActivitiesLog', { ...args.data })
  },
})

export const getAll = query({
  args: {
    deviceId: v.id('devices'),
    // type: v.optional(v.array(deviceActivityType)),
  },
  handler: async (ctx, args) => {
    // verify ownership
    const device = await ctx.db.get(args.deviceId)
    if (!device || !(await isCurrentUserOwner({ ctx, device }))) {
      throw new Error('Device not found')
    }
    return await ctx.db
      .query('deviceActivitiesLog')
      .withIndex('device', (q) => q.eq('deviceId', args.deviceId))
      .collect()
  },
})
