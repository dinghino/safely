import { GeospatialIndex } from '@convex-dev/geospatial'
import { components } from '../_generated/api'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

import { getCurrentUserOrThrow } from '../lib/auth'

export const geospatial = new GeospatialIndex<
  Id<'trackLocation'>,
  {
    session: Id<'trackSession'>
    user: Id<'users'>
  }
>(components.geospatial)

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
export async function _getSession(options: { ctx: QueryCtx; sessionId: Id<'trackSession'> }) {
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
