import { useMutation } from "convex/react"
import { useDeviceInfo } from "./use-device-info"
import { api } from "@safely/backend/convex/_generated/api"

export function useRegisterDevice() {
  const deviceInfo = useDeviceInfo()
  const register = useMutation(api.devices.registerDevice)

  return async function registerDevice() {
    const { deviceId, platform } = deviceInfo
    if (!deviceId) return
    await register({ deviceId, platform })
  }
}
