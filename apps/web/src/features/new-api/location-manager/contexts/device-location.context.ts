import { createContext } from '@workspace/react-utils'
import type { DeviceLocationContextValue } from '../types'

export const [DeviceLocationContext, useDeviceLocation] =
  createContext<DeviceLocationContextValue>('DeviceLocationContext')
