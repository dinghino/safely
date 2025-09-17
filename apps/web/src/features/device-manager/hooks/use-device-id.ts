'use client'

import { useEffect, useRef } from 'react'
import generateId from '@/lib/nanoid'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'

const staticId = generateId()

export function useDeviceId() {
  const sent = useRef(false)
  const [deviceId, setId, removeId] = useLocalStorage({
    key: 'safely_device_id',
    getInitialValueInEffect: false,
  })

  useEffect(() => {
    console.log('Device ID:', deviceId)
    if (sent.current) return
    sent.current = true
    if (!deviceId) setId(staticId)
  }, [deviceId, setId])

  return [deviceId, removeId] as const
}
