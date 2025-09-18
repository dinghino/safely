import type { Infer } from 'convex/values'
import type { deviceStatus } from './schemas/devices.schema'
export type DeviceStatus = Infer<typeof deviceStatus>
