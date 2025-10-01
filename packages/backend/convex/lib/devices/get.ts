import type { Doc, Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'

/**
 * Returns a device by its internal Convex ID or throws if not found
 */
export async function deviceByDeviceId(ctx: QueryCtx, deviceId: string) {
  const device = await ctx.db
    .query('devices')
    .withIndex('by_deviceId', (q) => q.eq('deviceId', deviceId))
    .first()

  // if (!device) throw new Error('Device not found')

  return device
}
/**
 * Returns a device by its internal Convex ID or throws if not found
 */
export async function deviceById(ctx: QueryCtx, deviceId: Id<'devices'>) {
  const device = await ctx.db.get(deviceId)
  if (!device) throw new Error('Device not found')
  return device
}

export async function addSettings(ctx: QueryCtx, device: Doc<'devices'>) {
  const settings = await ctx.db
    .query('deviceSettings')
    .withIndex('by_deviceId', (q) => q.eq('deviceId', device._id))
    .first()
  return { ...device, settings: settings! }
}
