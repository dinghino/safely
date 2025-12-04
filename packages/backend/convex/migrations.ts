import type { Point } from '@convex-dev/geospatial'
import type { Doc } from '../types'
import { internalMutation } from './_generated/server'

import { geospatial } from './tracking/lib'
import * as gis from './lib/gis'

export const migrateTrackMetadata = internalMutation({
  handler: async (ctx) => {
    const sessions = await ctx.db.query('trackSession').collect()

    const points = await Promise.all(
      sessions.flatMap(async (session) => {
        const locations = await ctx.db
          .query('trackLocation')
          .withIndex('by_session', (q) => q.eq('session', session._id))
          .collect()
        const points = await Promise.all(
          locations.map(async (loc) => {
            return await geospatial.get(ctx, loc._id)
          }),
        )
        return { sessionId: session._id, points }
        // const { results } = await geospatial.query(ctx, {
        //   shape: { type: 'rectangle', rectangle: world },
        //   filter: (q) => q.eq('session', session._id),
        // })
        // return { sessionId: session._id, points: results }
      }),
    )

    await Promise.all(
      sessions.map(async (session) => {
        const count = session.pointsCount
        const gisData = points.find((i) => i.sessionId === session._id)
        const distance = calculateTotalDistance(gisData?.points)

        await ctx.db.insert('trackMetadata', {
          session: session._id,
          points: count,
          distance: distance ?? 0,
          duration: getDuration(session),
          lastUpdated: session.endedAt ?? session.lastUpdatedAt ?? session.startedAt,
        })
      }),
    )
    console.log(`Migrated ${sessions.length} track sessions`)
  },
})

function getLastSessionTime(session: Doc<'trackSession'>): number {
  return session.endedAt ?? session.lastUpdatedAt ?? session.startedAt
}

function getDuration(session: Doc<'trackSession'>): number {
  return getLastSessionTime(session) - session.startedAt
}

function calculateTotalDistance(points: Array<{ coordinates: Point } | null> | undefined): number {
  if (!points || points.length < 2) return 0
  let totalDistance = 0
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]?.coordinates
    const p2 = points[i]?.coordinates
    if (!p1 || !p2) continue
    totalDistance += gis.distanceInMeters(p1, p2)
  }
  return totalDistance
}
