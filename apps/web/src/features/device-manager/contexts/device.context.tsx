'use client'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import { createContext } from '@workspace/react-utils'

import { useDeviceId } from '@/shared/hooks/use-device-id'

import type { Device } from '@/entities/device/types'
import { useRegisterDevice } from '@/features/device-manager'

export namespace DeviceProvider {
  export type Value = {
    registerDevice: () => Promise<void>
    canRegister: boolean
    device: Device | null | undefined
  }
  export type Props = {
    children: React.ReactNode
  }
}

const [DeviceContext, useDeviceContext] = createContext<DeviceProvider.Value>('DeviceContext')

export { useDeviceContext }

// @copilot: This component manages device registration and location watching
// todo: Consider extracting location watching logic to a separate hook
export const DeviceProvider: React.FC<DeviceProvider.Props> = ({ children }) => {
  const registerDevice = useRegisterDevice()
  const [deviceId] = useDeviceId()
  const device = useQuery(api.devices.get, { deviceId })

  // const { startWatching, stopWatching } = useDeviceLocation()

  // useEffect(() => {
  //   if (!device) {
  //     stopWatching()
  //     return
  //   }

  //   const { trackingMode } = device.settings

  //   if (trackingMode === 'off') {
  //     stopWatching()
  //   } else {
  //     // Start with normal accuracy - SessionManager will upgrade when needed
  //     startWatching({ highAccuracy: false })
  //   }
  // }, [device, startWatching, stopWatching])

  const value = {
    device,
    registerDevice,
    canRegister: !device,
  }

  return <DeviceContext value={value}>{children}</DeviceContext>
}

export default DeviceProvider
