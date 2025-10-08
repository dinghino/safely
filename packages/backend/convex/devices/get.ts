import { v } from 'convex/values'
import { query } from '../_generated/server'
import { getCurrentUserOrThrow } from '../lib/auth'
import * as helpers from '../lib/devices'

/**
 * Get devices for the current user
 * @todo add pagination
 */
export const all = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)
    const data = await ctx.db
      .query('devices')
      .withIndex('by_owner', (q) => q.eq('owner', user._id))
      .collect()

    return await Promise.all(data.map((dev) => helpers.get.embedSettings(ctx, dev)))
  },
})

/**
 * Get a single device by its deviceId (not the internal Convex ID)
 * @throws if the device does not exists or does not belong to the current user
 * @todo retrieve active tracking session
 */
export const one = query({
  // args: { deviceId: v.union(v.string(), v.id('devices')) },
  args: { deviceId: v.optional(v.id('devices')) },
  handler: async (ctx, args) => {
    if (!args.deviceId) return undefined
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(args.deviceId)
    // const device = await helpers.get.deviceByDeviceId(ctx, args.deviceId)
    // todo: better error handling - not found vs not owned
    // if (!device || device.owner !== user._id) throw new Error('Device not found')
    if (!device || device.owner !== user._id) return undefined

    return await helpers.get.embedSettings(ctx, device)
  },
})
