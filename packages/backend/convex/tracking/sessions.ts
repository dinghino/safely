import { v } from 'convex/values'
import { api } from '../_generated/api'
import { internalMutation, mutation, query } from '../_generated/server'

// import { Service.auth.getCurrentUserOrThrow } from '../lib/auth'
import { _getActiveSession, getSession, geospatial, isSessionOpen } from './lib'
// import { isCurrentUserOwner } from '../lib/devices'
import { Service } from '../lib'
/**
 * Get a tracking session by its ID
 * @throws if no session or not owned by current user
 */
export const get = query({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => getSession({ ctx, ...args }),
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
  // todo: make this non optional
  // todo: make paginated
  args: { deviceId: v.optional(v.id('devices')) },
  handler: async (ctx, args) => {
    const { deviceId } = args
    if (!deviceId) return null

    const device = await ctx.db.get(deviceId)
    const isOwner = await Service.devices.isCurrentUserOwner({ ctx, device })
    if (!device || !isOwner) {
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
 * Internal mutation to create a new tracking session for a device.
 * @note this is called by the requests module to create a session for the
 * target device when it acknowledges a request.
 * @todo deprecate `start` and move all logic here, since only the server
 * should be able to create sessions.
 * @todo add optional first location point creation
 */
export const create = internalMutation({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const user = await Service.auth.getCurrentUserOrThrow(ctx)

    // allows only the target device to create a session from a request with
    // the authed user being required to be logged in and owning the device
    const device = await ctx.db.get(deviceId)
    const isOwner = await Service.devices.isCurrentUserOwner({ ctx, device })
    if (!device || !isOwner) {
      throw new Error('Device not found')
    }

    const existing = await _getActiveSession({ ctx, deviceId: device._id })
    // todo: silently return existing session id
    if (existing) throw new Error('There is already an open session for this device')

    const newSession = await ctx.db.insert('trackSession', {
      device: device._id,
      owner: user._id,
      // fixme: do we need ALL these timestamps? we already have _createdAt
      timestamp: Date.now(),
      startedAt: Date.now(),
      pointsCount: 0,
    })
    // todo: the actual mode and other settings should come from somewhere, either
    // - a general device settings that the user can manage (based on device type, status etc)
    // - a global settings object with the same conditions
    // - the request itself (i.e. the sender can request a specific mode)
    // for now we just use `active` and we'll figure out the rest later
    await ctx.runMutation(api.devices.manage.setTrackingMode, {
      deviceId: device._id,
      mode: 'active',
    })
    return newSession
  },
})

/**
 * @todo implement closing sessions through internal mutations from requests api
 */
export const close = internalMutation({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, args) => {
    const { deviceId } = args

    const device = await ctx.db.get(deviceId)
    const isOwner = await Service.devices.isCurrentUserOwner({ ctx, device })
    if (!device || !isOwner) {
      throw new Error('Device not found')
    }

    const session = await _getActiveSession({ ctx, deviceId })
    if (!session) throw new Error('No active session found for this device')
    if (!isSessionOpen(session)) throw new Error('Session already closed')

    await Promise.all([
      ctx.runMutation(api.devices.manage.setTrackingMode, {
        deviceId: device._id,
        mode: 'passive',
      }),
      ctx.db.patch('trackSession', session._id, { endedAt: Date.now() }),
    ])
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
 * @deprecated use the new api through sessions.requests to create sessions
 */
export const start = mutation({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, args) => {
    const user = await Service.auth.getCurrentUserOrThrow(ctx)
    const device = await ctx.db.get(args.deviceId)
    const isOwner = await Service.devices.isCurrentUserOwner({ ctx, device })
    if (!device || !isOwner) {
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

    await Promise.all([
      // modify device settings to handle tracking properly
      ctx.runMutation(api.devices.manage.setTrackingMode, { deviceId: device._id, mode: 'active' }),
    ])
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
 * @deprecated use the new api through sessions.requests to stop sessions
 */
export const stop = mutation({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => {
    const { sessionId } = args
    const session = await getSession({ ctx, sessionId })

    if (!session) throw new Error('Session not found')
    if (!isSessionOpen(session)) throw new Error('Session already closed')

    await ctx.runMutation(api.devices.manage.setTrackingMode, {
      deviceId: session.device,
      mode: 'passive',
    })

    return ctx.db.patch('trackSession', session._id, { endedAt: Date.now() })
  },
})

/**
 * Remove a session and all associated location points
 * fixme: this fails if there are too many points as it is now.
 * @issue #7
 */
export const remove = mutation({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => {
    const { sessionId } = args
    const session = await getSession({ ctx, sessionId })
    if (!session) throw new Error('Session not found')
    if (isSessionOpen(session)) throw new Error('Cannot delete an open session')

    // delete all associated locations first
    const locations = await ctx.db
      .query('trackLocation')
      .withIndex('by_session', (q) => q.eq('session', session._id))
      .collect()
    // run the delete
    await Promise.all(
      locations.map((loc) => [
        ctx.db.delete('trackLocation', loc._id),
        geospatial.remove(ctx, loc._id),
      ]),
    )

    // then delete the session itself
    await ctx.db.delete('trackSession', session._id)
    return true
  },
})
