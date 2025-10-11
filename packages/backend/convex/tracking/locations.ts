import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'

import { api } from '../_generated/api'
import { mutation, query } from '../_generated/server'
import { locationMetadata } from '../schemas/shared'

import * as lib from './lib'

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
    const { sessionId, point, metadata = {} } = args
    const session = await lib.getSession({ ctx, sessionId })
    if (!session || !lib.isSessionOpen(session)) {
      throw new Error('Session not found or closed')
    }

    const device = await ctx.db.get(session.device)
    if (!device) throw new Error(`Device not found for session ${sessionId} session`)

    if (!lib.isSessionOfDevice(session, device)) {
      // todo: this can never happen right now since we query the device from session
      // but we need to have this type of guard. we might have to add some info about
      // the device in the request later on.
      // todo: make custom errors with metadata and codes
      throw new Error(`Session ${sessionId} does not belong to device ${device._id}`)
    }

    // create trackLocation first - need the ID for geospatial
    const locationId = await ctx.db.insert('trackLocation', {
      session: session._id,
      user: session.owner,
      metadata: metadata,
    })

    /**
     * also update last known location since this is likely more recent or accurate
     * due to tracking being usually with tighter options.
     * todo: cleanup heartbeat system
     * since we update last known with heartbeat, we might want to either send a heartbeat
     * here and/or set up things so that the heartbeat knows last updated and figures out
     * when to send the next one in sync with tracking updates
     * (i.e. we reset timer on tracking update or tell clients to disable heartbeat when tracking is active)
     */
    const updateLastKnown = ctx.runMutation(api.devices.location.setLast, {
      deviceId: device._id,
      point,
      metadata,
    })

    // update session data
    const patchSession = ctx.db.patch(session._id, {
      pointsCount: session.pointsCount + 1,
      lastUpdatedAt: Date.now(),
    })
    // create the GIS point for the location
    const addPoint = lib.geospatial.insert(ctx, locationId, point, {
      session: session._id,
    })

    // resolve all updates in parallel
    await Promise.all([updateLastKnown, patchSession, addPoint])
    return locationId
  },
})

/**
 * Retrieve location data for a given session
 * @throws if session does not exist or not owned by current user
 * @todo check query size and add pagination if needed - might cause issues
 * if points are too many
 */
export const getSession = query({
  args: { sessionId: v.id('trackSession') },
  handler: async (ctx, args) => {
    const { sessionId } = args
    const session = await lib.getSession({ ctx, sessionId })
    const locations = await ctx.db
      .query('trackLocation')
      .withIndex('by_session', (q) => q.eq('session', session._id))
      .order('desc')
      .collect()

    const locationsData = await Promise.all(
      locations.map(async (data) => {
        const gis = await lib.geospatial.get(ctx, data._id)
        return { ...data, coordinates: gis?.coordinates || null }
      }),
    )
    return locationsData
  },
})
