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
  UserRoundMinusIcon,
  UserRoundPlusIcon,
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
  shared: UserRoundPlusIcon,
  unshared: UserRoundMinusIcon,
  request_issued: MailIcon,
  request_acknowledged: MailIcon,
  session_started: PlayIcon,
  session_ended: CheckCircle2Icon,
  registered_session: CassetteTapeIcon,
  session_shared: Share2Icon,
}

export const colors: Record<DeviceLogType, string> = {
  //lifecycle
  registered: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  unregistered: 'text-red-500 bg-red-300/15 dark:bg-red-700/15',
  connected: 'text-lime-500 bg-lime-300/15 dark:bg-lime-700/15',
  disconnected: 'text-red-500 bg-red-300/15 dark:bg-red-700/15',
  // social sharing
  shared: 'text-blue-500 bg-blue-300/15 dark:bg-blue-700/15',
  unshared: 'text-amber-500 bg-amber-300/15 dark:bg-amber-700/15',
  // sessions and commands
  request_issued: 'text-yellow-500 bg-yellow-300/15 dark:bg-yellow-700/15',
  request_acknowledged: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  session_started: 'text-green-500 bg-green-300/15 dark:bg-green-700/15',
  session_ended: 'text-emerald-500 bg-emerald-300/15 dark:bg-emerald-700/15',
  registered_session: 'text-cyan-500 bg-cyan-300/15 dark:bg-cyan-700/15',
  session_shared: 'text-blue-500 bg-blue-300/15 dark:bg-blue-700/15',
}

export function getEventIcon(type: DeviceLogType) {
  return icons[type] || CircleQuestionMarkIcon
}

export function getEventColor(type: DeviceLogType) {
  return colors[type] || 'text-muted-foreground'
}
