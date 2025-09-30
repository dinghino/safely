import { v } from 'convex/values'
import { api } from '../_generated/api'
import { mutation, query } from '../_generated/server'

import { getCurrentUserOrThrow } from '../auth'
import { _getActiveSession, _getSession, geospatial, isSessionOpen } from './lib'

/**
 * Get a tracking session by its ID
 * @throws if no session or not owned by current user
 */
export const get = query({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => _getSession({ ctx, ...args }),
})

/**
 * Get the active (last) session for a device, if any
 * @throws if no device or not owned by current user
 * @returns session if active or null if none
 */
export const getActive = query({
  args: { deviceId: v.optional(v.id('devices')) },
  handler: async (ctx, args) => {
    const { deviceId } = args
    if (!deviceId) return null
    return _getActiveSession({ ctx, deviceId })
  },
})

/**
 * Get all sessions for a given device
 */
export const getAllOfDevice = query({
  args: { deviceId: v.optional(v.id('devices')) },
  handler: async (ctx, args) => {
    const { deviceId } = args
    if (!deviceId) return null

    const device = await ctx.db.get(deviceId)
    const user = await getCurrentUserOrThrow(ctx)
    if (!device || device.owner !== user._id) {
      throw new Error('Device not found')
    }
    return ctx.db
      .query('trackSession')
      .withIndex('by_device', (q) => q.eq('device', device._id))
      .order('desc')
      .collect()
  },
})

/**
 * Start a new tracking session for a device
 * @todo allow only same device to request a new session. if a device wants to
 * track another device it needs to send a request, that the tracked device will
 * need to read, acknowledge and start a session for
 *
 *
 * - verifies the device belongs to the current user
 * - creates a new trackSession entry
 * - (optionally) creates the first trackLocation entry for the given session
 *
 * @throws if device does not exist or does not belong to the current user
 * @throws if there's already an open session for this device
 */
export const start = mutation({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(args.deviceId)
    if (!device || device.owner !== user._id) {
      throw new Error('Device not found')
    }

    // retrieve the last created session for this device
    const existing = await _getActiveSession({ ctx, deviceId: device._id })

    if (existing && isSessionOpen(existing)) {
      // throw new Error('There is already an open session for this device')
      return existing._id
    }

    const newSession = await ctx.db.insert('trackSession', {
      device: device._id,
      owner: user._id,
      timestamp: Date.now(),
      startedAt: Date.now(),
      pointsCount: 0,
    })

    await ctx.runMutation(api.devices.setTrackingMode, { deviceId: device._id, mode: 'active' })
    return newSession
  },
})

/**
 * Stop (close) a tracking session
 * @todo can any device close a session? or only the device that started it?
 *   we can add this later and for now allow any device of the user to close.
 *
 * - verifies the session belongs to the current user and is still open
 * - updates the endedAt timestamp to close the session
 */
export const stop = mutation({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => {
    const { sessionId } = args
    const session = await _getSession({ ctx, sessionId })

    if (!session) throw new Error('Session not found')
    if (!isSessionOpen(session)) throw new Error('Session already closed')

    await ctx.runMutation(api.devices.setTrackingMode, {
      deviceId: session.device,
      mode: 'passive',
    })

    return ctx.db.patch(session._id, { endedAt: Date.now() })
  },
})

export const remove = mutation({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => {
    const { sessionId } = args
    const session = await _getSession({ ctx, sessionId })
    if (!session) throw new Error('Session not found')
    if (isSessionOpen(session)) throw new Error('Cannot delete an open session')

    // delete all associated locations first
    const locations = await ctx.db
      .query('trackLocation')
      .withIndex('by_session', (q) => q.eq('session', session._id))
      .collect()
    // run the delete
    await Promise.all(
      locations.map((loc) => [ctx.db.delete(loc._id), geospatial.remove(ctx, loc._id)]),
    )

    // then delete the session itself
    await ctx.db.delete(session._id)
    return true
  },
})
