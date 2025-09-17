'use client'
import { useEffect } from 'react'

import { HEARTBEAT_INTERVAL_MS } from '../device.config'
import { useRegisterDevice } from '../hooks/use-register-device'

export const DeviceManager = () => {
  const heartbeat = useRegisterDevice()

  useEffect(() => {
    const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS)
    heartbeat() // initial call
    return () => clearInterval(interval)
  }, [heartbeat])

  return null
}
