import { useMemo } from 'react'
import { View } from 'react-native'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'

import type { Device } from '@workspace/backend/types'

export namespace DeviceStatusBadge {
  export type Props = {
    device: Device
    className?: string
    label?: boolean
  } & Omit<React.ComponentProps<typeof Badge>, 'children'>
}
/**
 * Displays a badge indicating the status of a device.
 * @note this comes directly from apps/web (with minor adjustments for native)
 * and is not working properly with native styles yet, only showing the dot for now.
 */
export function DeviceStatusBadge(props: DeviceStatusBadge.Props) {
  const { device, className, label = true, ...rest } = props
  return (
    <Badge
      variant="secondary"
      {...rest}
      className={cn('aspect-square', !label && 'p-1.5', className)}
    >
      <DeviceStatusDot device={device} />
      {label && <Text className="sr-only">{device.status}</Text>}
    </Badge>
  )
}

export function DeviceStatusDot(props: { device: Device; className?: string }) {
  const { device, className } = props
  const color = useMemo(() => {
    switch (device.status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }, [device.status])
  return <View className={cn('h-2 w-2 rounded-full', color, className)} />
}
