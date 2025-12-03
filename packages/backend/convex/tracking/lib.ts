import { GeospatialIndex, type Point } from '@convex-dev/geospatial'
import { api, components } from '../_generated/api'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

import { getCurrentUserOrThrow } from '../lib/auth'
import type { LocationMetadata } from '../../types'

import * as gis from '../lib/gis'

type TrackingGisFilters = {
  // allows to get all point of a session
  session: Id<'trackSession'>
}

export const geospatial = new GeospatialIndex<Id<'trackLocation'>, TrackingGisFilters>(
  components.geospatial,
)

export function isSessionOpen(session: { endedAt?: number }) {
  return session.endedAt === undefined
}

/**
 * Verify that a session belongs to a given device
 */
export function isSessionOfDevice(session: Doc<'trackSession'>, device: Doc<'devices'>) {
  if (!session || !device) return false
  if (session.owner !== device.owner) return false
  if (session.device !== device._id) return false
  return true
}

/**
 * Retrieve a session and verify it belongs to the current user
 * @throws if no session or not owned by current user
 */
export async function getSession(options: { ctx: QueryCtx; sessionId: Id<'trackSession'> }) {
  const { ctx, sessionId } = options
  const user = await getCurrentUserOrThrow(ctx)
  const session = await ctx.db.get(sessionId)
  if (!session || session.owner !== user._id) {
    throw new Error('Session not found')
  }
  return session
}

export async function _getActiveSession(options: { ctx: QueryCtx; deviceId: Id<'devices'> }) {
  const { ctx, deviceId } = options
  const device = await ctx.db.get(deviceId)
  if (!device) return null

  const session = await ctx.db
    .query('trackSession')
    // .withIndex('by_device', (q) => q.eq('device', device._id))
    .withIndex('active', (q) => q.eq('device', device._id).eq('endedAt', undefined))
    .order('desc')
    .first()
  return session
}
/**
 * Add a location point to a tracking session.
 * @note verify ownership of session against user and/or device before calling
 * this, as we assume that everything is verified and valid here.
 */
export async function addLocationPoint(options: {
  ctx: MutationCtx
  session: Doc<'trackSession'> | null
  data: {
    point: Point
    metadata?: LocationMetadata | undefined
  }
}) {
  const { ctx, session, data } = options
  if (!session || !isSessionOpen(session)) {
    throw new Error('Session not found or closed')
  }

  // validate session ownership on device
  const device = await ctx.db.get(session.device)
  if (!device) throw new Error(`Device not found for session ${session._id} session`)
  if (!isSessionOfDevice(session, device)) {
    throw new Error(`Session ${session._id} does not belong to device ${device._id}`)
  }

  const { point, metadata } = data

  // create trackLocation first - need the ID for geospatial
  const locationId = await ctx.db.insert('trackLocation', {
    session: session._id,
    user: session.owner,
    metadata: metadata ?? {},
  })
  // run updates

  /**
   * also update last known location since this is likely more recent or accurate
   * due to tracking being usually with tighter options.
   * fixme: cleanup heartbeat system or remove from here
   *
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
  const addPoint = geospatial.insert(ctx, locationId, point, {
    session: session._id,
  })

  // resolve all updates in parallel
  await Promise.all([updateLastKnown, patchSession, addPoint])
  return locationId
}

type MetadataValues = Omit<Doc<'trackMetadata'>, '_id' | 'session' | '_creationTime'>

export async function upsertSessionMetadata(options: {
  ctx: MutationCtx
  session: Doc<'trackSession'>
  point: Point
}) {
  const { ctx, session, point } = options
  // get current metadata if any
  const current = await ctx.db
    .query('trackMetadata')
    .withIndex('session', (q) => q.eq('session', session._id))
    .first()

  // calculate new values
  let points = current?.points ?? 0
  let distance = current?.distance ?? 0
  let duration = current?.duration ?? 0

  // get last location to calculate distance delta
  const prevLocation = await ctx.db
    .query('trackLocation')
    .withIndex('by_session', (q) => q.eq('session', session._id))
    .order('desc')
    .first()

  if (prevLocation) {
    const prevPoint = await geospatial.get(ctx, prevLocation._id)
    const lastCoords = prevPoint?.coordinates || null
    distance += lastCoords ? gis.distanceInMeters(lastCoords, point) : 0
  }

  // add the time delta between last update and now - cascade last time from metadata
  // to session start time as last option
  const lastUpdate = current?.lastUpdated ?? session.lastUpdatedAt ?? session.startedAt
  const lastUpdated = Date.now()
  duration += Date.now() - lastUpdate
  points += 1

  // patch or insert
  const data: MetadataValues = {
    points,
    distance,
    duration,
    lastUpdated,
  }

  if (current) {
    await ctx.db.patch(current._id, data)
    return current._id
  }

  const metadataId = await ctx.db.insert('trackMetadata', {
    session: session._id,
    ...data,
  })
  return metadataId
}
