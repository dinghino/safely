import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'

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

    // first update metadata so we have correct counts and last insert location
    await lib.upsertSessionMetadata({ ctx, session, point })

    const locationId = await lib.addLocationPoint({
      ctx,
      session,
      data: { point, metadata },
    })
    // update session metadata

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
      .order('asc')
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
