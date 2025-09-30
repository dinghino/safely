import { GeospatialIndex, point } from '@convex-dev/geospatial'
import { v } from 'convex/values'
import { api, components } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, type QueryCtx, query } from './_generated/server'

import { getCurrentUserOrThrow } from './auth'
import { trackLocationMetadata } from './schemas/tracker.schema'

const geospatial = new GeospatialIndex<
  Id<'trackLocation'>,
  {
    session: Id<'trackSession'>
    user: Id<'users'>
  }
>(components.geospatial)

// ----------------------------------------------------------------------------
// Session management

/**
 * Get a tracking session by its ID
 * @throws if no session or not owned by current user
 */
export const getSession = query({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => _getSession({ ctx, ...args }),
})

/**
 * Get the active (last) session for a device, if any
 * @throws if no device or not owned by current user
 * @returns session if active or null if none
 */
export const getActiveSession = query({
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
export const getDeviceSessions = query({
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
export const startSession = mutation({
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
export const stopSession = mutation({
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

export const deleteSession = mutation({
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

// ----------------------------------------------------------------------------
// GIS management

/**
 * Add a location point to an active session and update related session and
 * dispatcher device data
 *
 */
export const addLocationPoint = mutation({
  args: {
    sessionId: v.id('trackSession'),
    point: point,
    metadata: v.optional(trackLocationMetadata),
  },
  handler: async (ctx, args) => {
    const { sessionId, point, metadata } = args
    const session = await _getSession({ ctx, sessionId })
    if (!session || !isSessionOpen(session)) {
      throw new Error('Session not found or closed')
    }

    const device = await ctx.db
      .query('devices')
      .withIndex('by_deviceId', (q) => q.eq('deviceId', session.device))
      .first()

    if (!device) {
      throw new Error(`Device not found for session ${sessionId} session`)
    }

    if (!isSessionOfDevice(session, device)) {
      // todo: this can never happen right now since we query the device from session
      // but we need to have this type of guard. we might have to add some info about
      // the device in the request later on.
      // todo: make custom errors with metadata and codes
      throw new Error(`Session ${sessionId} does not belong to device ${device._id}`)
    }

    // create trackLocation first - need the ID for geospatial
    const trackLocation = await ctx.db.insert('trackLocation', {
      session: session._id,
      user: session.owner,
      metadata: metadata || {},
    })

    // we can update the dispatching device metadata while we do this, so we
    // have a proper up-to-date last_seen and position for the device itself
    // this can be used for general monitoring and, for example, to show the
    // last known position to other people or in dashboards.
    // @note: this COULD replace completely for the heartbeat mechanism on the
    // devices, even though we might want to keep it until (and if) we make tracking
    // a continous background process and not based on sessions
    const deviceUpdates = device
      ? [
          ctx.db.patch(device._id, { last_seen: Date.now() }),
          ctx.runMutation(api.devices.updatePosition, { deviceId: device._id, position: point }),
        ]
      : []

    const patchSession = ctx.db.patch(session._id, {
      pointsCount: session.pointsCount + 1,
      lastUpdatedAt: Date.now(),
    })
    const addPoint = geospatial.insert(ctx, trackLocation, point, {
      session: session._id,
      user: session.owner,
    })

    // resolve all updates in parallel since we can
    await Promise.all([...deviceUpdates, patchSession, addPoint])
    return trackLocation
  },
})

/**
 * Retrieve location data for a given session
 * @throws if session does not exist or not owned by current user
 */
export const getSessionLocations = query({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => {
    const { sessionId } = args
    const session = await _getSession({ ctx, sessionId })
    const locations = await ctx.db
      .query('trackLocation')
      .withIndex('by_session', (q) => q.eq('session', session._id))
      .order('desc')
      // todo: add pagination / limit
      .collect()

    const locationsData = await Promise.all(
      locations.map(async (loc) => {
        const gis = await geospatial.get(ctx, loc._id)
        gis?.coordinates
        return { ...loc, coordinates: gis?.coordinates || null }
      }),
    )
    return locationsData
  },
})

// ----------------------------------------------------------------------------
// Helpers

function isSessionOpen(session: { endedAt?: number }) {
  return session.endedAt === undefined
}

/**
 * Verify that a session belongs to a given device
 */
function isSessionOfDevice(session: Doc<'trackSession'>, device: Doc<'devices'>) {
  if (!session || !device) return false
  if (session.owner !== device.owner) return false
  if (session.device !== device._id) return false
  return true
}

/**
 * Retrieve a session and verify it belongs to the current user
 * @throws if no session or not owned by current user
 */
async function _getSession({ ctx, sessionId }: { ctx: QueryCtx; sessionId: Id<'trackSession'> }) {
  const user = await getCurrentUserOrThrow(ctx)
  const session = await ctx.db.get(sessionId)
  if (!session || session.owner !== user._id) {
    throw new Error('Session not found')
  }
  return session
}

async function _getActiveSession({ ctx, deviceId }: { ctx: QueryCtx; deviceId: Id<'devices'> }) {
  const user = await getCurrentUserOrThrow(ctx)
  const device = await ctx.db.get(deviceId)

  if (!device || device.owner !== user._id) {
    // throw new Error('Device not found')
    return null
  }

  const session = await ctx.db
    .query('trackSession')
    // .withIndex('by_device', (q) => q.eq('device', device._id))
    .withIndex('active', (q) => q.eq('device', device._id).eq('endedAt', undefined))
    .order('desc')
    .first()
  return session
}
