import { CircleQuestionMarkIcon, MonitorIcon, SmartphoneIcon, type LucideIcon } from 'lucide-react'
import type { Device } from '../types'
import { useMemo } from 'react'

type DeviceType = Device['type']

export namespace DeviceIcon {
  export type DeviceOrType = { type: DeviceType } | DeviceType
  export type Props = {
    device: DeviceOrType
  } & React.ComponentProps<LucideIcon>
}

export const DeviceIcon: React.FC<DeviceIcon.Props> = ({ device, ...props }) => {
  const Icon = useMemo(
    () =>
      isDesktop(device) ? MonitorIcon : isMobile(device) ? SmartphoneIcon : CircleQuestionMarkIcon,
    [device],
  )
  return <Icon {...props} />
}

function getType(device: DeviceIcon.DeviceOrType) {
  if (typeof device === 'string') return device
  return device.type
}

function isMobile(device: DeviceIcon.DeviceOrType) {
  return getType(device) === 'mobile'
}

function isDesktop(device: DeviceIcon.DeviceOrType) {
  return getType(device) === 'desktop'
}
