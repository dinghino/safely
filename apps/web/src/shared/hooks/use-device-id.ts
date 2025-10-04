'use client'

import { useEffect } from 'react'
import { NANOID_LENGTH } from '@/lib/nanoid'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'
import type { Id } from '@workspace/backend/dataModel'

export function useDeviceId() {
  const [deviceId, setId, removeId] = useLocalStorage({
    key: 'safely_device_id',
    getInitialValueInEffect: false,
  })

  // todo: remove in the future before release
  useEffect(() => {
    if (!deviceId) return
    // make sure we have a valid convex id since we are migrating from nanoid
    if (deviceId.length === NANOID_LENGTH) removeId()
  }, [deviceId, removeId])

  return [deviceId as Id<'devices'>, setId, removeId] as const
}
