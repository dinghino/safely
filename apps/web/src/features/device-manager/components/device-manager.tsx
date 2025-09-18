'use client'
import { useEffect } from 'react'

import { HEARTBEAT_INTERVAL_MS } from '../device.config'
import { useRegisterDevice } from '../hooks/use-register-device'
import { useIdle } from '@/shared/hooks/use-idle'

export const DeviceManager = () => {
  const heartbeat = useRegisterDevice()
  const isIdle = useIdle(2 * HEARTBEAT_INTERVAL_MS, { initialState: false })

  useEffect(() => {
    const interval = setInterval(
      () => heartbeat({ status: isIdle ? 'idle' : 'online' }),
      HEARTBEAT_INTERVAL_MS,
    )
    heartbeat({ status: 'online' })

    return () => {
      clearInterval(interval)
      heartbeat({ status: 'offline' })
    }
  }, [heartbeat, isIdle])

  return null
}
