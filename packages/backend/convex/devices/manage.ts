import { v } from 'convex/values'

import { internalMutation, mutation } from '../_generated/server'
import { api } from '../_generated/api'

import { getCurrentUserOrThrow } from '../lib/auth'

import { deviceStatus, trackingMode } from '../schemas/enums'

import { helpers } from '../lib/devices'

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

    // create new device

    const id = await ctx.db.insert('devices', {
      ...args,
      last_seen: Date.now(),
      status: 'unknown',
      owner: user._id,
      type: helpers.determineDeviceType(args.platform),
      mode: 'off',
    })

    const device = await ctx.db.get(id)
    await helpers.options.populateDeviceOptions(ctx, device!)

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
    // todo: move to separate functions
    const cleanupMutations = []
    // delete all options first
    const options = await ctx.db
      .query('deviceOptions')
      .withIndex('device_mode', (q) => q.eq('deviceId', device._id))
      .collect()
    cleanupMutations.push(options?.map((opt) => ctx.db.delete(opt._id)))
    // cleanup last known locations
    cleanupMutations.push(helpers.location.deleteLastKnown({ ctx, deviceId: device._id }))

    await Promise.all(cleanupMutations.flat())

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
    return await ctx.db.patch(device._id, { mode })
  },
})
