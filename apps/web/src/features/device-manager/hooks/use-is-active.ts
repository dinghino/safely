'use client'

import { dayjs } from '@/lib/dayjs'
import { DEVICE_INACTIVE_THRESHOLD_MS } from '../device.config'

export function useIsActive({ device }: { device: { last_seen: dayjs.ConfigType } }) {
  // if time since last_seen < 15 seconds, active
  return dayjs().diff(dayjs(device.last_seen), 'millisecond') < DEVICE_INACTIVE_THRESHOLD_MS
}
