import { STORE_KEY } from '@/constants'
import { useSecureStore } from './use-secure-store'
import type { Device, Id } from '@workspace/backend/types'

export function useSessionToken() {
  return useSecureStore<string>({ key: STORE_KEY.DEVICE_SESSION_TOKEN })
}

export function useDeviceId() {
  return useSecureStore<Id<'devices'>>({ key: STORE_KEY.DEVICE_ID })
}

export function useDeviceInfo() {
  return useSecureStore<Device>({
    key: STORE_KEY.DEVICE,
    loader: JSON.parse,
    transformer: JSON.stringify,
  })
}
