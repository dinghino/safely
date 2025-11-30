import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/types'
import { useQuery } from 'convex/react'

export function useDeviceLogs(deviceId: Id<'devices'>) {
  return useQuery(api.devices.activities.getAll, { deviceId })
}
