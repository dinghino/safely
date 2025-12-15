'use client'

import { useLocalStorage } from '@/shared/hooks/use-local-storage'

export function useDeviceToken() {
  const [deviceToken, setToken, removeToken] = useLocalStorage({
    key: 'safely_device_token',
    getInitialValueInEffect: false,
  })

  return [deviceToken, setToken, removeToken] as const
}
