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

// Helper to extract AnyFunctionReference since it is not exposed by convex apparently
type ExtractConstraint<T = FunctionReturnType<any>> = T extends FunctionReturnType<infer U>
  ? U extends infer Base
    ? Base
    : never
  : never

type FromFunction<T extends ExtractConstraint> = NonNullable<FunctionReturnType<T>>

//

export type DeviceType = Infer<typeof deviceType>
export type DeviceStatus = Infer<typeof deviceStatus>
export type LocationMetadata = Infer<typeof locationMetadata>
export type TrackingMode = Infer<typeof trackingMode>

export type TrackingRequestType = Infer<typeof trackingRequestType>

export type { Doc, Id } from '../convex/_generated/dataModel'

export type Device = FromFunction<typeof api.devices.get.one>
export type GPSAccuracy = Device['settings']['location']['accuracy']

import type { DeviceLogType } from '../convex/schemas/device-activities.schema'
export type { DeviceLogType }

export type DeviceActivityLog = FromFunction<typeof api.devices.activities.getAll>[number]
export type DeviceLogPayload<T extends DeviceLogType = DeviceLogType> = Extract<
  DeviceActivityLog,
  { type: T }
>['payload']

// region POIs

export type PoiCategoryGroup = FromFunction<typeof api.pois.groups.get>
export type PoiCategory = FromFunction<typeof api.pois.categories.get>
