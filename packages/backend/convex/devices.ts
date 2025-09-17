import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUserOrThrow } from './auth'

export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)
    return ctx.db
      .query('devices')
      .withIndex('by_owner', (q) => q.eq('owner', user._id))
      .collect()
  },
})

export const registerDevice = mutation({
  args: {
    name: v.optional(v.string()),
    deviceId: v.string(),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const user = await getCurrentUserOrThrow(ctx)
    const existingDevice = await ctx.db
      .query('devices')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
      // .filter((q) => q.eq('deviceId', deviceId))
      .first()

    if (existingDevice && existingDevice.owner !== user._id) {
      throw new Error('Device ID already registered to another user')
    }

    if (existingDevice) {
      // Update last_seen timestamp and any other info provided
      await ctx.db.patch(existingDevice._id, { ...args, last_seen: Date.now() })
      return existingDevice._id
    }

    return ctx.db.insert('devices', {
      ...args,
      owner: user._id,
      last_seen: Date.now(),
    })
  },
})

export const renameDevice = mutation({
  args: { deviceId: v.id('devices'), name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(args.deviceId)
    if (!device) {
      throw new Error('Device not found')
    }
    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    return ctx.db.patch(device._id, { name: args.name })
  },
})

export const deleteDevice = mutation({
  args: { id: v.id('devices') },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(args.id)
    if (!device) {
      throw new Error('Device not found')
    }
    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    return ctx.db.delete(device._id)
  },
})
