/**
 * Seeding file for Convex database.
 * ```sh
 * npx convex run seed
 * ```
 */
import type { Infer } from 'convex/values'
import type { MutationCtx } from '../_generated/server'

import type { DeviceType, TrackingMode } from '../../types'
import type { locatorOptions } from '../schemas/devices.schema'
import { populateDeviceOptions } from '../lib/devices/options'

type OptionKey = { type: DeviceType; mode: TrackingMode }
type DefaultOptionsMap = Map<OptionKey, Infer<typeof locatorOptions>>

const mobileOptions: DefaultOptionsMap = new Map([
  [
    { type: 'mobile', mode: 'off' },
    { accuracy: 'VERY_LOW', maximumAge: 60000, timeout: 30000 },
  ],
  [
    { type: 'mobile', mode: 'passive' },
    { accuracy: 'LOW', maximumAge: 30000, timeout: 20000 },
  ],
  [
    { type: 'mobile', mode: 'active' },
    { accuracy: 'MEDIUM', maximumAge: 10000, timeout: 10000 },
  ],
  [
    { type: 'mobile', mode: 'aggressive' },
    { accuracy: 'HIGH', maximumAge: 5000, timeout: 5000 },
  ],
])

const desktopOptions: DefaultOptionsMap = new Map([
  [
    { type: 'desktop', mode: 'off' },
    { accuracy: 'VERY_LOW', maximumAge: 60000, timeout: 30000 },
  ],
  [
    { type: 'desktop', mode: 'passive' },
    { accuracy: 'LOW', maximumAge: 30000, timeout: 20000 },
  ],
  [
    { type: 'desktop', mode: 'active' },
    { accuracy: 'LOW', maximumAge: 10000, timeout: 10000 },
  ],
  [
    { type: 'desktop', mode: 'aggressive' },
    { accuracy: 'MEDIUM', maximumAge: 5000, timeout: 5000 },
  ],
])

// for unknown device we use the same options as desktop (static devices)
const unknownTypeOptions: DefaultOptionsMap = new Map(
  Array.from(desktopOptions).map(([key, value]) => [
    { ...key, type: 'unknown' as DeviceType },
    value,
  ]),
)

// merge the two maps
const defaultOptions: DefaultOptionsMap = new Map([
  ...unknownTypeOptions,
  ...mobileOptions,
  ...desktopOptions,
])

/**
 * Seeder function to create or update the default device settings available
 * in the `defaultDeviceSettings` table.
 *
 * @param ctx - Convex mutation context
 * @param override - whether to override existing settings for existing devices (default: false)
 */
export const createOptions = async (ctx: MutationCtx, override?: boolean) => {
  // determine if the given key already exists. if so we just need to replace the values
  const getExisting = (key: OptionKey) => {
    return ctx.db
      .query('defaultDeviceSettings')
      .withIndex('key', (q) => q.eq('key', key))
      .first()
  }

  const promises: Promise<unknown>[] = []
  console.log('🌱 Seeding default device settings...')
  for (const [key, options] of defaultOptions) {
    console.log(`seeding default options for ${JSON.stringify(key)}`)
    const exists = await getExisting(key)
    if (!exists) {
      console.log('➕ Inserting new default device settings...', key)
      promises.push(ctx.db.insert('defaultDeviceSettings', { key, ...options }))
      continue
    }
    if (!override) {
      console.log('ℹ️  Default device settings already exist, skipping...', key)
      continue
    }
    console.log('🔄 Updating existing default device settings...', key)
    promises.push(ctx.db.replace(exists._id, { ...exists, ...options }))
  }
  await Promise.all(promises)
  console.log('✅ Default device settings seeded.')
}

/**
 * Utility seed to add the `mode` field to all existing devices
 * and set it to 'off' if not already set.
 */
export async function addModeToAll(ctx: MutationCtx) {
  const devices = await ctx.db.query('devices').collect()
  const promises: Promise<unknown>[] = []
  for (const device of devices) {
    if (device.mode) continue
    promises.push(ctx.db.patch('devices', device._id, { mode: 'off' }))
  }
  console.log(`🌱 Adding mode 'off' to ${promises.length} devices`)
  await Promise.all(promises)
}

/**
 * Utility seed to populate device options for all existing devices from the
 * global default options, based on device type.
 */
export async function populateOptions(ctx: MutationCtx) {
  const devices = await ctx.db.query('devices').collect()
  console.log(`🌱 Populating device options for ${devices.length} devices`)
  const promises = devices.map((device) => populateDeviceOptions(ctx, device))
  await Promise.all(promises)
  console.log(`🌱 Populated device options for ${devices.length} devices`)
}
