import {
  CassetteTapeIcon,
  CheckCircle2Icon,
  CircleQuestionMarkIcon,
  MailIcon,
  PartyPopperIcon,
  PlayIcon,
  PowerIcon,
  PowerOffIcon,
  Share2Icon,
  XCircleIcon,
  type LucideIcon,
} from 'lucide-react'
import type { DeviceLogType } from '../types'

// region icon

export const icons: Record<DeviceLogType, LucideIcon> = {
  registered: PartyPopperIcon,
  unregistered: XCircleIcon,
  connected: PowerIcon,
  disconnected: PowerOffIcon,
  shared: Share2Icon,
  unshared: Share2Icon,
  request_issued: MailIcon,
  request_acknowledged: MailIcon,
  session_started: PlayIcon,
  session_ended: CheckCircle2Icon,
  registered_session: CassetteTapeIcon,
}

export const colors: Record<DeviceLogType, string> = {
  //lifecycle
  registered: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  unregistered: 'text-red-500 bg-red-300/15 dark:bg-red-700/15',
  connected: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  disconnected: 'text-red-500 bg-red-300/15 dark:bg-red-700/15',
  // social sharing
  shared: 'text-blue-500 bg-blue-300/15 dark:bg-blue-700/15',
  unshared: 'text-blue-500 bg-blue-300/15 dark:bg-blue-700/15',
  // sessions and commands
  request_issued: 'text-yellow-500 bg-yellow-300/15 dark:bg-yellow-700/15',
  request_acknowledged: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  session_started: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  session_ended: 'text-teal-500 bg-teal-300/15 dark:bg-teal-700/15',
  registered_session: 'text-purple-500 bg-purple-300/15 dark:bg-purple-700/15',
}

export function getEventIcon(type: DeviceLogType) {
  return icons[type] || CircleQuestionMarkIcon
}

export function getEventColor(type: DeviceLogType) {
  return colors[type] || 'text-muted-foreground'
}
