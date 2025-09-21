import type { Device } from '@/entities/device/types'

export interface DeviceContextValue {
  registerDevice: () => Promise<void>
  canRegister: boolean
  device: Device | null | undefined
}

export namespace DeviceContextProvider {
  export type Props = {
    children: React.ReactNode
  }
}

