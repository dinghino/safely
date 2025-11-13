import MOCK_LOGS from '@/features/device-log/mocks'
import type { Id } from '@workspace/backend/types'

export function useDeviceLogs(_deviceId: Id<'devices'> | undefined) {
  return MOCK_LOGS.sort((a, b) => b._creationTime - a._creationTime)
}
