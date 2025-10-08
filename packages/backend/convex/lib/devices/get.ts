import type { Doc, Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'

/**
 * Returns a device by its internal Convex ID or throws if not found
 */
export async function deviceById(ctx: QueryCtx, deviceId: Id<'devices'>) {
  const device = await ctx.db.get(deviceId)
  if (!device) throw new Error('Device not found')
  return device
}

export async function embedSettings(ctx: QueryCtx, device: Doc<'devices'>) {
  const options = await ctx.db
    .query('deviceOptions')
    .withIndex('device_mode', (q) => q.eq('deviceId', device._id).eq('mode', device.mode))
    .first()
  // remove redundant fields for the consumer
  const { _id, _creationTime, mode, deviceId, ...settings } = options!
  return { ...device, settings }
}
