import type { Infer } from 'convex/values'
import type {
  deviceStatus,
  deviceType,
  trackingMode,
  trackingRequestType,
} from '../convex/schemas/enums'
import type { locationMetadata } from '../convex/schemas/shared'
import type { FunctionReturnType } from 'convex/server'
import type { api } from '../convex/_generated/api'

export type DeviceType = Infer<typeof deviceType>
export type DeviceStatus = Infer<typeof deviceStatus>
export type LocationMetadata = Infer<typeof locationMetadata>
export type TrackingMode = Infer<typeof trackingMode>

export type TrackingRequestType = Infer<typeof trackingRequestType>

export type { Doc, Id } from '../convex/_generated/dataModel'

export type Device = NonNullable<FunctionReturnType<typeof api.devices.get.one>>
export type GPSAccuracy = Device['settings']['location']['accuracy']

import type { DeviceLogType } from '../convex/schemas/device-activities.schema'
export type { DeviceLogType }

export type DeviceActivityLog = NonNullable<
  FunctionReturnType<typeof api.devices.activities.getAll>
>[number]
export type DeviceLogPayload<T extends DeviceLogType = DeviceLogType> = Extract<
  DeviceActivityLog,
  { type: T }
>['payload']
