import { DEFAULT_HEARTBEAT_INTERVAL_MS } from '../constants'
import type { Doc } from '../../_generated/dataModel'
import type { MutationCtx } from '../../_generated/server'

/**
 * Populate default device options for the given (NEW) device based on what the
 * device says it is (mobile/desktop)
 */
export async function populateDeviceOptions(
  ctx: MutationCtx,
  device: Doc<'devices'>,
  override = false,
) {
  const defaults = await ctx.db
    .query('defaultDeviceSettings')
    .withIndex('type', (q) => q.eq('key.type', device.type))
    .collect()

  if (defaults.length === 0) {
    console.warn(`No default device settings found for type ${device.type}`)
    return
  }
  const promises: Promise<unknown>[] = []
  for (const def of defaults) {
    // if we are not overriding, check if options already exist for this device/mode
    // if it does skip the creation
    const exist = ctx.db
      .query('deviceOptions')
      .withIndex('device_mode', (q) => q.eq('deviceId', device._id).eq('mode', def.key.mode))
      .first()
    if (!override && (await exist)) continue

    const mutation = ctx.db.insert('deviceOptions', {
      deviceId: device._id,
      mode: def.key.mode,
      heartbeat: {
        interval: DEFAULT_HEARTBEAT_INTERVAL_MS,
      },
      location: {
        accuracy: def.accuracy,
        maximumAge: def.maximumAge,
        timeout: def.timeout,
      },
    })
    promises.push(mutation)
  }
  await Promise.all(promises)
}
