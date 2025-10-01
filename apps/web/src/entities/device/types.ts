import type { Doc } from '@workspace/backend/dataModel'

export type DeviceDoc = Doc<'devices'>
export type Device = DeviceDoc & { settings: DeviceSettings }
export type DeviceSettings = Doc<'deviceSettings'>
