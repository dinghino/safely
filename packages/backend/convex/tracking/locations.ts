import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'

import { api } from '../_generated/api'
import { mutation, query } from '../_generated/server'
import { locationMetadata } from '../schemas/shared'

import { _getSession, geospatial, isSessionOfDevice, isSessionOpen } from './lib'

/**
 * Add a location point to an active session and update related session and
 * dispatcher device data
 *
 */
export const add = mutation({
  args: {
    sessionId: v.id('trackSession'),
    point: point,
    metadata: v.optional(locationMetadata),
  },
  handler: async (ctx, args) => {
    const { sessionId, point, metadata } = args
    const session = await _getSession({ ctx, sessionId })
    if (!session || !isSessionOpen(session)) {
      throw new Error('Session not found or closed')
    }

    const device = await ctx.db.get(session.device)

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
          ctx.runMutation(api.devices.location.setLast, {
            deviceId: device._id,
            position: point,
          }),
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
export const getSession = query({
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
