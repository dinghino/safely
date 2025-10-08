import type { Infer } from 'convex/values'
import type { deviceStatus, deviceType, trackingMode, trackingRequestType } from '../convex/schemas/enums'
import type { trackLocationMetadata } from '../convex/schemas/tracker.schema'
import type { FunctionReturnType } from 'convex/server'
import type { api } from '../convex/_generated/api'

export type DeviceType = Infer<typeof deviceType>
export type DeviceStatus = Infer<typeof deviceStatus>
export type LocationMetadata = Infer<typeof trackLocationMetadata>
export type TrackingMode = Infer<typeof trackingMode>

export type TrackingRequestType = Infer<typeof trackingRequestType>

export type { Doc, Id } from '../convex/_generated/dataModel'

export type Device = NonNullable<FunctionReturnType<typeof api.devices.get.one>>
export type GPSAccuracy = Device['settings']['location']['accuracy']
