import type { Heartbeat } from './types'

export const DEFAULT_INTERVAL = 1000 * 60 * 5 // 5 minutes

export const REQUIRED_ACTORS = ['dispatcher', 'disconnect'] satisfies Array<keyof Heartbeat.Actors>
