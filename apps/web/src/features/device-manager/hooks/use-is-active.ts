'use client'

import type { dayjs } from '@/lib/dayjs'
// import { DEVICE_INACTIVE_THRESHOLD_MS } from '../device.config'

export function useIsActive({
  device,
}: {
  device: { last_seen: dayjs.ConfigType; status: string }
}) {
  // return dayjs().diff(dayjs(device.last_seen), 'millisecond') < DEVICE_INACTIVE_THRESHOLD_MS
  return device.status === 'online'
}
