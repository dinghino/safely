import type { GPSAccuracy } from '@workspace/backend/types'

/**
 * Device options constraints
 * ---
 * These SHOULD technically come from the backend for all apps, but since for now
 * we can only customize values from the web app, we define them here.
 */
export namespace Defaults {
  export const MIN_HEARTBEAT = 1000 * 60 // 1 minute
  export const MAX_HEARTBEAT = 1000 * 60 * 60 // 1 hour

  export const MIN_MAX_AGE = 1000 * 60 // 1 minute
  export const MAX_MAX_AGE = 1000 * 60 * 60 // 1 hour

  export const MIN_TIMEOUT = 1000 * 5 // 5 seconds
  export const MAX_TIMEOUT = 1000 * 60 * 2 // 2 minutes
}

export const GPS_ACCURACY_OPTIONS = [
  { label: 'Very Low', value: 'VERY_LOW' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
] satisfies { label: string; value: GPSAccuracy }[]
