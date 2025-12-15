import * as get from './get'
import * as heartbeat from './heartbeat'
import * as options from './options'
import * as location from './location'

export { geospatial } from './location'

export const helpers = {
  get,
  heartbeat,
  options,
  location,
  determineDeviceType,
  createDevice,
  createActivityLog,
}

import type { DeviceType, Doc, Id } from '../../../types'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { getCurrentUserOrThrow } from '../auth'
import { createActivityLog } from './logs'

type FromExpo = 'ios' | 'android' | 'windows' | 'macos' | 'web'
type FromNavigator = 'MacIntel' | 'Win32' | 'Linux x86_64'
type KnownDeviceTypes = FromExpo | FromNavigator | (string & {})

/**
 * Determine a device type from a platform string
 * @note this is not exhaustive but covers the main platforms that we know of
 */
export function determineDeviceType(platform?: KnownDeviceTypes): DeviceType {
  if (!platform) return 'unknown'

  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile'
    case 'windows':
    case 'Linux x86_64':
    case 'MacIntel':
    case 'Win32':
    case 'macos':
    case 'web':
      return 'desktop'
    default:
      return 'unknown'
  }
}

type CreateDeviceArgs = {
  name?: string
  platform?: string
  sessionToken?: string
  user: { _id: Id<'users'> }
}
/**
 * Wrapper to create a device and populate related tables
 * @returns the created device ID
 *
 * @note this is going to be a pretty large function to bootstrap new devices
 *  with a bunch of functionalities in it. might be worth making a service class
 *  to handle it cleanly and test it
 */
export async function createDevice(ctx: MutationCtx, args: CreateDeviceArgs) {
  const { user, ...data } = args
  const id = await ctx.db.insert('devices', {
    ...data,
    last_seen: Date.now(),
    status: 'unknown',
    owner: user._id,
    type: helpers.determineDeviceType(args.platform),
    mode: 'off',
  })
  // populate initial options
  const device = (await ctx.db.get(id))! // since we just created it we know it's there
  await helpers.options.populateDeviceOptions(ctx, device)
  return id
}

// region auth and type checks

/**
 * Helper function to check if the current user (authenticated in ctx) owns
 * the device with the given deviceId
 * @returns true if ownership is confirmed
 */
export async function isCurrentUserOwner(options: {
  ctx: QueryCtx
  device: Doc<'devices'> | null
}) {
  const { ctx, device } = options
  if (!device) return false

  const user = await getCurrentUserOrThrow(ctx)
  return device.owner === user._id
}
