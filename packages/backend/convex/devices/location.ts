import { v } from 'convex/values'
import { point } from '@convex-dev/geospatial'

import { mutation, query } from '../_generated/server'

import { locationMetadata } from '../schemas/shared'
import { helpers, geospatial } from '../lib/devices'

/**
 * Runs a heartbeat of a given device and updates its last known position
 * in the geospatial index.
 * @throws no device or not owned by user
 * todo: auth check
 * @note this is technically redundant if we use update position in heartbeat
 * or last known position through session tracking
 * @note this could be an internalMutation only called from heartbeat or tracking
 */
export const setLast = mutation({
  args: { deviceId: v.id('devices'), point: point, metadata: v.optional(locationMetadata) },
  handler: async (ctx, args) => {
    const { deviceId, point, metadata = {} } = args
    const device = await helpers.get.deviceById(ctx, deviceId)

    // check if we know a last known location for the device
    const locationId = await helpers.location.upsertLastKnown({ ctx, deviceId, metadata })

    await Promise.all([
      // remove old position if set
      geospatial.remove(ctx, deviceId),
      // add it back as new point - no we cannot patch them apparently :/
      geospatial.insert(ctx, device._id, point, { locationId }),
      ctx.db.patch(device._id, { last_seen: Date.now() }),
    ])
  },
})

/**
 * Get the last known position of a device from the geospatial index
 *
 * todo: auth check or make internal only
 */
export const getLast = query({
  args: { deviceId: v.id('devices') },
  handler: async (ctx, args) => {
    const { deviceId } = args
    const device = await helpers.get.deviceById(ctx, deviceId)

    if (!device) throw new Error('Device not found')

    return await helpers.location.getLastKnown({ ctx, deviceId })
  },
})
