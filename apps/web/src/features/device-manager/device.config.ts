// device monitoring intervals and thresholds
// these should be handled by actions on the backend with scheduled functions
// or the presence component once we figure out how it works, since it should
// be able to track general presence, but the examples are related to users and
// chatrooms which complicates things a bit...?

/**
 * How often devices should send a heartbeat signal to indicate they are online
 */
export const HEARTBEAT_INTERVAL_MS = 1_000 * 60
/**
 * If a device hasn't sent a heartbeat in this amount of time, it is considered inactive
 */
export const DEVICE_INACTIVE_THRESHOLD_MS = HEARTBEAT_INTERVAL_MS * 2
