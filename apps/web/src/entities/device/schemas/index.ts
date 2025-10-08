import z from 'zod/v4'
import { Defaults } from '../constants'

export const HeartbeatOptionsSchema = z.object({
  interval: z
    .number()
    .min(Defaults.MIN_HEARTBEAT)
    .max(Defaults.MAX_HEARTBEAT)
    .describe('Interval in ms between heartbeats'),
})

export const LocatorOptionsSchema = z.object({
  accuracy: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH']), // maps to GPSAccuracy from backend
  maximumAge: z
    .number()
    .min(Defaults.MIN_MAX_AGE)
    .max(Defaults.MAX_MAX_AGE)
    .describe('Maximum age in ms of a cached location'),
  timeout: z
    .number()
    .min(Defaults.MIN_TIMEOUT)
    .max(Defaults.MAX_TIMEOUT)
    .describe('Timeout in ms to fetch a new location'),
})

/**
 * Validation schema for device options form
 * @todo setup convex to use zod directly.
 * @see https://stack.convex.dev/typescript-zod-function-validation#using-zod-for-argument-validation-server-side
 */
export const DeviceOptionsSchema = z.object({
  heartbeat: HeartbeatOptionsSchema,
  location: LocatorOptionsSchema,
})
