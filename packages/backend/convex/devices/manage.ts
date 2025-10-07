import { v } from 'convex/values'

import { internalMutation, mutation } from '../_generated/server'
import { api } from '../_generated/api'

import { getCurrentUserOrThrow } from '../lib/auth'

import { deviceStatus, trackingMode } from '../schemas/enums'

import * as helpers from '../lib/devices'
import { DEFAULT_HEARTBEAT_INTERVAL_MS, TRACKING_MODE_UPDATE_INTERVALS } from '../lib/constants'

export const register = mutation({
  args: {
    name: v.optional(v.string()),
    platform: v.optional(v.string()),
    deviceId: v.optional(v.id('devices')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    if (args.deviceId) {
      const existing = await ctx.db.get(args.deviceId)

      if (!existing) return null
      if (existing.owner !== user._id)
        throw new Error('Device ID already registered to another user')

      await ctx.runMutation(api.devices.heartbeat.send, { deviceId: existing._id })

      return args.deviceId
    }
    const id = await ctx.db.insert('devices', {
      ...args,
      last_seen: Date.now(),
      status: 'unknown',
      owner: user._id,
    })
    await ctx.db.insert('deviceSettings', {
      deviceId: id,
      trackingMode: 'off',
      updateIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
      heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
    })

    await ctx.runMutation(api.devices.heartbeat.send, { deviceId: id! })
    return id
  },
})

/**
 * Allow a user to delete one of their devices
 * @throws no device or not owned by user
 */
export const unregister = mutation({
  args: { id: v.id('devices') },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, args.id)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    return await ctx.db.delete(device._id)
    // todo: soft delete, anonymize or cascade delete all device data?
  },
})

/**
 * Allow a user to rename one of their devices
 * @throws no device or not owned by user
 */
export const rename = mutation({
  args: { deviceId: v.id('devices'), name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, args.deviceId)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    return ctx.db.patch(device._id, { name: args.name })
  },
})

// explicit state setters

/**
 * Change the status of the given device.
 * @note this is for now internal to learn convex and might be removed or exposed later
 */
export const setState = internalMutation({
  args: { deviceId: v.id('devices'), status: deviceStatus },
  handler: async (ctx, args) => {
    const { deviceId, status } = args
    await ctx.db.patch(deviceId, { status })
  },
})

/**
 * Explicitly and authoritatively set the tracking mode of a device
 * @throws if the device does not exist or is not owned by the current user
 * @note this should not be used manually and will be likely deprecated
 */
export const setTrackingMode = mutation({
  args: { deviceId: v.id('devices'), mode: trackingMode },
  handler: async (ctx, args) => {
    const { deviceId, mode } = args

    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, deviceId)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }

    const settings = await ctx.db
      .query('deviceSettings')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
      .unique()

    if (!settings) throw new Error('Device settings not found')

    await ctx.db.patch(settings._id, {
      trackingMode: mode,
      updateIntervalMs: TRACKING_MODE_UPDATE_INTERVALS[mode],
    })
  },
})
