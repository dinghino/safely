import type { Doc } from '@workspace/backend/dataModel'

export type DeviceSettings = Doc<'deviceSettings'>
export type DeviceDoc = Doc<'devices'>
export type Device = DeviceDoc & { settings: DeviceSettings }

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

