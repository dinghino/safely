import { v } from 'convex/values'
import { GeospatialIndex, point } from '@convex-dev/geospatial'

import { internalMutation, mutation, query } from './_generated/server'
import { api, components } from './_generated/api'
import type { Id } from './_generated/dataModel'

import { getCurrentUserOrThrow } from './auth'

import { deviceStatus, trackingMode } from './schemas/enums'
import { trackLocationMetadata } from './schemas/tracker.schema'

import * as helpers from './lib/devices'
import { DEFAULT_HEARTBEAT_INTERVAL_MS, TRACKING_MODE_UPDATE_INTERVALS } from './lib/constants'

/** User Devices locations geospatial index */
const geospatial = new GeospatialIndex<Id<'devices'>, { deviceId: string }>(components.geospatial)

/**
 * Get devices for the current user
 * @todo add pagination
 */
export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)
    const data = await ctx.db
      .query('devices')
      .withIndex('by_owner', (q) => q.eq('owner', user._id))
      .collect()

    return await Promise.all(data.map((dev) => helpers.get.addSettings(ctx, dev)))
  },
})

/**
 * Get a single device by its deviceId (not the internal Convex ID)
 * @throws if the device does not exists or does not belong to the current user
 * @todo retrieve active tracking session
 */
export const get = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceByDeviceId(ctx, args.deviceId)
    // todo: better error handling - not found vs not owned
    // if (!device || device.owner !== user._id) throw new Error('Device not found')
    if (!device || device.owner !== user._id) return undefined
    return await helpers.get.addSettings(ctx, device)
  },
})

/**
 * Get the last known position of a device from the geospatial index
 * todo: auth check?
 */
export const lastKnownPosition = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const device = await helpers.get.deviceByDeviceId(ctx, deviceId)

    if (!device) throw new Error('Device not found')

    const result = await geospatial.get(ctx, device._id)
    return result ?? null
  },
})

/**
 * Allows a user to register and heartbeat a device.
 * - If the device does not exists it creates a new entry
 * - If device exists, executes a heartbeat updating the last_seen timestamp
 *@throws if device exists and belongs to another user
 */
export const register = mutation({
  args: {
    name: v.optional(v.string()),
    deviceId: v.string(),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const user = await getCurrentUserOrThrow(ctx)

    let id: Id<'devices'>
    const existingDevice = await helpers.get.deviceByDeviceId(ctx, deviceId)

    if (existingDevice) {
      id = existingDevice._id

      if (existingDevice.owner !== user._id) {
        // todo: obfuscate error?
        throw new Error('Device ID already registered to another user')
      }
    }

    if (!existingDevice) {
      id = await ctx.db.insert('devices', {
        ...args,
        last_seen: Date.now(),
        status: 'unknown',
        owner: user._id,
      })
      await ctx.db.insert('deviceSettings', {
        deviceId: id,
        trackingMode: 'off',
        updateIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS, // default to 24h to have a high value
      })
    }

    /// handles updating last_seen, status and session (location not provided here)
    await ctx.runMutation(api.devices.heartbeat, { deviceId: id! })
  },
})

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

export const heartbeat = mutation({
  args: {
    // deviceId: v.id('devices'),
    deviceId: v.id('devices'),
    location: v.optional(
      v.object({
        point: point,
        metadata: v.optional(trackLocationMetadata),
      }),
    ),
  },
  returns: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { deviceId, location } = args

    // ownership check -----------------------------------

    const user = await getCurrentUserOrThrow(ctx)
    const device = await helpers.get.deviceById(ctx, deviceId)
    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }

    // update or create session - single session per device
    let sessionId: string
    const session = await ctx.db
      .query('deviceSessions')
      .withIndex('deviceId', (q) => q.eq('deviceId', deviceId))
      .unique()

    if (session) {
      sessionId = session.sessionId
    } else {
      sessionId = crypto.randomUUID()
      await ctx.db.insert('deviceSessions', { deviceId, sessionId })
    }

    await helpers.heartbeat.removeScheduleDisconnect(ctx, sessionId)

    ///
    ///

    // update device data - we do not update user since devices could be IoT
    // to update other entities we need some discriminator on the devices

    const last_seen = Date.now()
    await ctx.db.patch(deviceId, { last_seen, status: 'online' })

    // handle location data if provided
    // todo: move to /lib as helper to encapsulate all logic and flatten it
    if (location) {
      await geospatial.insert(ctx, deviceId, location.point, { deviceId: device.deviceId })
      // update tracking session if location data provided and session is open
      const activeSession = await ctx.runQuery(api.tracking.getActiveSession, { deviceId })
      if (activeSession) {
        await ctx.runMutation(api.tracking.addLocationPoint, {
          sessionId: activeSession._id,
          ...location,
        })
      }
    }

    // Get or generate token to disconnect session.
    const sessionToken = await helpers.heartbeat.getSessionToken(ctx, { sessionId })

    // Schedule timeout to disconnect this session if no heartbeat is received
    // todo: chain scheduled with some `idle` function before full disconnect
    // if we want to implement idle states
    await helpers.heartbeat.scheduleDisconnect(ctx, { sessionId, sessionToken })
    return { sessionToken }
  },
})

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const { sessionToken } = args

    const tokenRecord = await helpers.heartbeat.getSessionTokenRecord(ctx, { sessionToken })
    if (!tokenRecord) return

    await ctx.db.delete(tokenRecord._id)

    const { sessionId } = tokenRecord
    const session = await helpers.heartbeat.getDeviceSession(ctx, sessionId)

    if (!session) {
      console.error('Session not found for token', sessionToken)
      return
    }

    await ctx.db.patch(session.deviceId, { status: 'offline' })

    await helpers.heartbeat.removeScheduleDisconnect(ctx, sessionId)
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
    const device = await helpers.get.deviceById(ctx, args.deviceId)

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
    const device = await helpers.get.deviceById(ctx, args.id)

    if (device.owner !== user._id) {
      throw new Error('You do not own this device')
    }
    return await ctx.db.delete(device._id)
  },
})

/**
 * Runs a heartbeat of a given device and updates its last known position
 * in the geospatial index.
 * @throws no device or not owned by user
 * todo: auth check
 * @note this is technically redundant if we use update position in heartbeat
 * or last known position through session tracking
 */
export const updatePosition = mutation({
  args: { deviceId: v.string(), position: point },
  handler: async (ctx, args) => {
    const { deviceId, position } = args
    const device = await helpers.get.deviceByDeviceId(ctx, deviceId)

    if (!device) throw new Error('Device not found')

    // since we are indexing on device._id we are constantly updating one point
    // so we don't need to care about duplicates
    await Promise.all([
      geospatial.insert(ctx, device._id, position, { deviceId }),
      ctx.db.patch(device._id, { last_seen: Date.now() }),
    ])
  },
})
