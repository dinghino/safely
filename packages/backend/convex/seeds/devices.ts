/**
 * Seeding file for Convex database.
 * ```sh
 * npx convex run seed
 * ```
 */
import type { Infer } from 'convex/values'
import type { DeviceType, TrackingMode } from '../../types'
import { internalMutation, type MutationCtx } from '../_generated/server'
import type { locatorOptions } from '../schemas/devices.schema'

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

// merge the two maps
const defaultOptions: DefaultOptionsMap = new Map([...mobileOptions, ...desktopOptions])

// export const deviceOptions = internalMutation({
// handler: async (ctx) => {
export const deviceOptions = async (ctx: MutationCtx) => {
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
    const exists = await getExisting(key)
    if (!exists) {
      promises.push(ctx.db.insert('defaultDeviceSettings', { key, ...options }))
      continue
    }
    promises.push(ctx.db.replace(exists._id, { ...exists, ...options }))
  }
  await Promise.all(promises)
  console.log('✅ Default device settings seeded.')
}
//   },
// })
