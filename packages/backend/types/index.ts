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

export type {
  DeviceLogType,
  DeviceActivityLog,
  DeviceLogPayload,
} from '../convex/schemas/device-activities.schema'
