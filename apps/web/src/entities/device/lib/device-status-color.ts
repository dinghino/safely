import type { DeviceStatus } from '@workspace/backend/types'

const backgrounds: Record<DeviceStatus, string> = {
  active: 'bg-cyan-500',
  online: 'bg-green-500',
  offline: 'bg-red-500',
  idle: 'bg-yellow-500',
  unknown: 'bg-gray-500',
} as const

const borders: Record<DeviceStatus, string> = {
  active: 'border-cyan-500',
  online: 'border-green-500',
  offline: 'border-red-500',
  idle: 'border-yellow-500',
  unknown: 'border-gray-500',
} as const

const rings: Record<DeviceStatus, string> = {
  active: 'ring-cyan-500',
  online: 'ring-green-500',
  offline: 'ring-red-500',
  idle: 'ring-yellow-500',
  unknown: 'ring-gray-500',
} as const

export function getDeviceStatusColor(
  device: { status: DeviceStatus },
  type: 'background' | 'border' | 'ring' = 'background',
): string {
  let set: Record<DeviceStatus, string>
  switch (type) {
    case 'background':
      set = backgrounds
      break
    case 'border':
      set = borders
      break
    case 'ring':
      set = rings
      break
  }
  return set[device.status] || set.unknown
}
