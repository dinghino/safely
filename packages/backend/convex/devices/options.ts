/**
 * Module that exposes devices options and settings mutations and queries.
 */

import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { getCurrentUserOrThrow } from '../lib/auth'
import { heartbeatOptions, locatorOptions } from '../schemas/devices.schema'
import { trackingMode } from '../schemas/enums'

/**
 * Returns all device options for a device.
 */
export const getAll = query({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, { deviceId }) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(deviceId)
    if (!device || device.owner !== user._id) return null
    return await ctx.db
      .query('deviceOptions')
      .withIndex('device_mode', (q) => q.eq('deviceId', deviceId))
      .collect()
  },
})

/**
 * Get device options for the specified device when running in the given `mode`.
 */
export const get = query({
  args: { deviceId: v.id('devices'), mode: trackingMode },
  handler: async (ctx, { deviceId, mode }) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(deviceId)
    if (!device || device.owner !== user._id) return null
    return await ctx.db
      .query('deviceOptions')
      .withIndex('device_mode', (q) => q.eq('deviceId', deviceId).eq('mode', mode))
      .first()
  },
})

/**
 * Save or update device options for a device and operating `mode`.
 * @note this should always run as `patch`, since options should be created when
 *       a device is registered.
 */
export const save = mutation({
  args: {
    deviceId: v.id('devices'),
    mode: trackingMode,
    data: v.object({
      location: locatorOptions,
      heartbeat: heartbeatOptions,
    }),
  },
  handler: async (ctx, { deviceId, mode, data }) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(deviceId)
    if (!device || device.owner !== user._id) throw new Error('Device not found')

    const existing = await ctx.db
      .query('deviceOptions')
      .withIndex('device_mode', (q) => q.eq('deviceId', deviceId).eq('mode', mode))
      .first()

    if (!existing) {
      return await ctx.db.insert('deviceOptions', {
        deviceId,
        mode,
        location: data.location,
        heartbeat: data.heartbeat,
      })
    }
    return await ctx.db.patch('deviceOptions', existing._id, {
      location: data.location,
      heartbeat: data.heartbeat,
    })
  },
})
