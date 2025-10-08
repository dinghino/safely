export * as get from './get'
export * as heartbeat from './heartbeat'
export * as options from './options'
import type { DeviceType } from '../../../types'

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
    case 'macos':
    case 'web':
      return 'desktop'
    default:
      return 'unknown'
  }
}
