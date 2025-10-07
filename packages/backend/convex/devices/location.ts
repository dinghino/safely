import { v } from 'convex/values'
import { GeospatialIndex, point } from '@convex-dev/geospatial'

import { mutation, query } from '../_generated/server'
import { components } from '../_generated/api'
import type { Id } from '../_generated/dataModel'

import * as helpers from '../lib/devices'

/** User Devices locations geospatial index */
export const geospatial = new GeospatialIndex<Id<'devices'>, { deviceId: string }>(
  components.geospatial,
)

/**
 * Runs a heartbeat of a given device and updates its last known position
 * in the geospatial index.
 * @throws no device or not owned by user
 * todo: auth check
 * @note this is technically redundant if we use update position in heartbeat
 * or last known position through session tracking
 */
export const setLast = mutation({
  args: { deviceId: v.id('devices'), position: point },
  handler: async (ctx, args) => {
    const { deviceId, position } = args
    const device = await helpers.get.deviceById(ctx, deviceId)

    // since we are indexing on device._id we are constantly updating one point
    // so we don't need to care about duplicates
    await Promise.all([
      geospatial.insert(ctx, device._id, position, { deviceId }),
      ctx.db.patch(device._id, { last_seen: Date.now() }),
    ])
  },
})

/**
 * Get the last known position of a device from the geospatial index
 * todo: auth check?
 */
export const getLast = query({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const device = await helpers.get.deviceById(ctx, deviceId)

    if (!device) throw new Error('Device not found')

    const result = await geospatial.get(ctx, device._id)
    return result ?? null
  },
})
