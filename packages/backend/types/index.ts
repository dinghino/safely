import type { Infer } from 'convex/values'
import type { deviceStatus, deviceType, trackingMode, trackingRequestType } from '../convex/schemas/enums'
import type { trackLocationMetadata } from '../convex/schemas/tracker.schema'

export type DeviceType = Infer<typeof deviceType>
export type DeviceStatus = Infer<typeof deviceStatus>
export type LocationMetadata = Infer<typeof trackLocationMetadata>
export type TrackingMode = Infer<typeof trackingMode>

export type TrackingRequestType = Infer<typeof trackingRequestType>

export type { Doc } from '../convex/_generated/dataModel'
