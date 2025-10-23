import { v } from 'convex/values'
import { query } from '../_generated/server'
import type { Id } from '../_generated/dataModel'

import { getCurrentUserOrThrow } from '../lib/auth'

import { helpers } from '../lib/devices'

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
 * Get a single device by its id
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
    if (!device || device.owner !== user._id) return null
    // embed current settings and return explicitly (no undefined)
    const withSettings = await helpers.get.embedSettings(ctx, device)
    return withSettings
  },
})

export const settings = query({
  args: { deviceId: v.optional(v.id('devices')) },
  handler: async (ctx, args) => {
    if (!args.deviceId) return undefined
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(args.deviceId)
    if (!device || device.owner !== user._id) return null
    return await helpers.get.getSettings(ctx, device)
  },
})

/**
 * Get all devices known on the platform
 * @unsafe for development only. there is no auth check or privacy guard on this
 *         procedure.
 * @todo remove before production or add admin auth check
 */
export const unsafe_dev = query({
  args: {},
  handler: async (ctx) => {
    const devices = await ctx.db.query('devices').collect()

    async function owner(deviceId: Id<'users'>) {
      const user = await ctx.db.get(deviceId)
      const { name, username, image } = user!
      return { name, username, image }
    }

    return await Promise.all(
      devices.map(async (device) => {
        const { _id: deviceId } = device
        const withSettings = await helpers.get.embedSettings(ctx, device)
        const location = await helpers.location.getLastKnown({ ctx, deviceId })
        const user = await owner(device.owner)
        return { ...withSettings, user, location }
      }),
    )
  },
})
