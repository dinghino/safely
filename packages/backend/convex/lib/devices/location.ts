import type { Infer } from 'convex/values'
import { GeospatialIndex } from '@convex-dev/geospatial'

import { components } from '../../_generated/api'
import type { Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { locationMetadata } from '../../schemas/shared'

type LocationMetadata = Infer<typeof locationMetadata>

type GeospatialFilters = {
  locationId: Id<'deviceLocations'>
}
/** User Devices locations geospatial index */
export const geospatial = new GeospatialIndex<Id<'devices'>, GeospatialFilters>(
  components.geospatial,
)

/**
 * Insert or update the last known location metadata for a device
 * @note internal helper
 */
export async function upsertLastKnown(opts: {
  ctx: MutationCtx
  deviceId: Id<'devices'>
  metadata?: LocationMetadata
}) {
  const { ctx, deviceId, metadata = {} } = opts
  const existing = await getLastKnowndata({ ctx, deviceId })
  if (!existing) {
    return await ctx.db.insert('deviceLocations', { deviceId, metadata })
  }
  await ctx.db.patch(existing._id, { metadata })
  return existing._id
}

/**
 * Retrieve the last known location data for a device if it exists
 * @note does not return the geospatial coordinates, just the metadata
 * @note internal helper, no auth checks or anything
 */
async function getLastKnowndata(opts: { ctx: QueryCtx; deviceId: Id<'devices'> }) {
  const { ctx, deviceId } = opts
  return await ctx.db
    .query('deviceLocations')
    .withIndex('device', (q) => q.eq('deviceId', deviceId))
    .unique()
}

/**
 * Helper function to get a consistent last known location object for a device
 * @returns null if no location data or coordinates, object if they exist
 */
export async function getLastKnown(opts: { ctx: QueryCtx; deviceId: Id<'devices'> }) {
  const { ctx, deviceId } = opts
  const location = await getLastKnowndata({ ctx, deviceId })
  if (!location) return null
  const gis = await geospatial.get(ctx, deviceId)
  if (!gis) return null

  return {
    ...location,
    coordinates: gis.coordinates,
  }
}

export async function deleteLastKnown(opts: { ctx: MutationCtx; deviceId: Id<'devices'> }) {
  const { ctx, deviceId } = opts
  const location = await getLastKnowndata({ ctx, deviceId })
  if (!location) return
  await Promise.all([ctx.db.delete(location._id), geospatial.remove(ctx, deviceId)])
}
