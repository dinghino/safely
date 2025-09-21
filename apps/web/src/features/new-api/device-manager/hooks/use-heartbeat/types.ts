import type { Device } from "../../types"
export type { Device }

export interface UseHeartbeatOptions {
  device: Device | null | undefined
  enabled?: boolean
}
