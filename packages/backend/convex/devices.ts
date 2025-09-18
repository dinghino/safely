import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'

import { mutation, query } from './_generated/server'
import { api } from './_generated/api'

import { getCurrentUserOrThrow } from './auth'
import { deviceLocations } from './geospatial'
import { deviceStatus } from './schemas/devices.schema'

export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)
    return ctx.db
      .query('devices')
      .withIndex('by_owner', (q) => q.eq('owner', user._id))
      .collect()
  },
})

export const getDevice = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db
      .query('devices')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', args.deviceId))
      .first()
    if (!device || device.owner !== user._id) {
      throw new Error('Device not found')
    }
    return device
  },
})

export const registerDevice = mutation({
  args: {
    name: v.optional(v.string()),
    deviceId: v.string(),
    platform: v.optional(v.string()),
    status: deviceStatus,
  },
  handler: async (ctx, args) => {
    const { deviceId, status = 'online' } = args
    const user = await getCurrentUserOrThrow(ctx)
    const existingDevice = await ctx.db
      .query('devices')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
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
      status,
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

export const updatePosition = mutation({
  args: {
    deviceId: v.string(),
    position: point,
  },
  handler: async (ctx, args) => {
    const { deviceId, position } = args
    const device = await ctx.runQuery(api.devices.getDevice, { deviceId })
    if (!device) {
      throw new Error('Device not found')
    }

    /**
     * todo: check nearby positions to avoid duplicate points?
     * use case: device sends multiple updates in the same location
     * should use geospatial query nearest
     * @see {@link https://www.convex.dev/components/geospatial#querying-the-points-nearest-a-query-point}
     * todo: implement TTL to remove old points maybe?
     * todo: separate table for tracking sessions and updates? it seems we cannot
     *       query geospatial index without a shape, so we cannot filter by time
     */

    await Promise.all([
      deviceLocations.insert(ctx, device._id, position, { deviceId }),
      ctx.db.patch(device._id, { last_seen: Date.now() }),
    ])
  },
})

export const lastKnownPosition = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const device = await ctx.runQuery(api.devices.getDevice, { deviceId })
    if (!device) {
      throw new Error('Device not found')
    }

    const result = await deviceLocations.get(ctx, device._id)
    return result ?? null
  },
})
