import { createContext } from '@workspace/react-utils'
import type { DeviceContextValue } from '../types'

export const [DeviceContext, useDeviceContext] = createContext<DeviceContextValue>('DeviceContext')
