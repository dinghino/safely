import type { TrackingMode } from '../../types'

const SECOND = 1000 // in ms
const MINUTE = 60 * SECOND // in ms

export const DEFAULT_HEARTBEAT_INTERVAL_MS = 10 * MINUTE // 10 minutes

export const TRACKING_MODE_UPDATE_INTERVALS: Record<TrackingMode, number> = {
  off: DEFAULT_HEARTBEAT_INTERVAL_MS,
  passive: 5 * MINUTE,
  active: 2 * MINUTE,
  aggressive: 30 * SECOND,
}
