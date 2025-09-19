import type { Infer } from 'convex/values'
import type { deviceStatus } from './schemas/devices.schema'
import type { trackLocationMetadata } from './schemas/tracker.schema'

export type DeviceStatus = Infer<typeof deviceStatus>
export type LocationMetadata = Infer<typeof trackLocationMetadata>
