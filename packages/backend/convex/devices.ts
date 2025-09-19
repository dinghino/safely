import { v } from 'convex/values'
import { GeospatialIndex, point } from '@convex-dev/geospatial'

import { mutation, query } from './_generated/server'
import { api, components } from './_generated/api'
import type { Id } from './_generated/dataModel'

import { getCurrentUserOrThrow } from './auth'

import { deviceStatus } from './schemas/devices.schema'
import { Presence } from '@convex-dev/presence'

/** User Devices locations geospatial index */
const geospatial = new GeospatialIndex<Id<'devices'>, { deviceId: string }>(components.geospatial)

/**
 * Get devices for the current user
 */
export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)
    return ctx.db
      .query('devices')
      .withIndex('by_owner', (q) => q.eq('owner', user._id))
      .collect()
  },
})

/**
 * Get a single device by its deviceId (not the internal Convex ID)
 * @throws if the device does not exists or does not belong to the current user
 * @todo retrieve active tracking session
 */
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

/**
 * Allows a user to register and heartbeat a device.
 * - If the device does not exists it creates a new entry
 * - If device exists, executes a heartbeat updating the last_seen timestamp
 *@throws if device exists and belongs to another user
 */
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

/**
 * Allow a user to rename one of their devices
 * @throws no device or not owned by user
 */
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

/**
 * Allow a user to delete one of their devices
 * @throws no device or not owned by user
 * @todo should we delete all device data also?
 */
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

/**
 * Runs a heartbeat of a given device and updates its last known position
 * in the geospatial index.
 * @throws no device or not owned by user
 */
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
      geospatial.insert(ctx, device._id, position, { deviceId }),
      ctx.db.patch(device._id, { last_seen: Date.now() }),
    ])
  },
})

/**
 * Get the last known position of a device from the geospatial index
 */
export const lastKnownPosition = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const device = await ctx.runQuery(api.devices.getDevice, { deviceId })
    if (!device) {
      throw new Error('Device not found')
    }

    const result = await geospatial.get(ctx, device._id)
    return result ?? null
  },
})

// // ---------------------------------------------------------------------------
// // device presence

// export const presence = new Presence<Id<'users'>, Id<'devices'>>(components.presence)

// /**
//  * Receives a heartbeat of a device for a given user.
//  * provide the device._id as userId
//  * and the user.external_id (clerk id) as roomId
//  *
//  * @note api requirements for usePresence hook
//  */
// export const heartbeat = mutation({
//   args: {
//     sessionId: v.string(),
//     interval: v.number(),
//     roomId: v.string(),
//     // deviceId: v.id('devices'),
//     userId: v.id('devices'),
//   },
//   handler: async (ctx, args) => {
//     const user = await getCurrentUserOrThrow(ctx)
//     const { sessionId, interval, userId } = args
//     await ctx.runMutation(api.presence.heartbeat, {
//       sessionId,
//       interval,
//       roomId: 'app', // we don't care about rooms here
//       userId: user._id,
//     })
//     return await presence.heartbeat(ctx, user._id, userId, sessionId, interval)
//   },
// })

// /**
//  * List all devices currently online for the current user
//  * roomToken is expected to be the user._id but for api requirements it needs to be
//  * called `roomToken`.
//  */
// export const list = query({
//   args: { roomToken: v.string() },
//   handler: async (ctx, args) => await presence.list(ctx, args.roomToken),
// })

// /**
//  * Handle disconnection of a presence session.
//  */
// export const disconnect = mutation({
//   args: { sessionToken: v.string() },
//   handler: async (ctx, { sessionToken }) => {
//     return await presence.disconnect(ctx, sessionToken)
//   },
// })
