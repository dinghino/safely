import type { DeviceLogPayload, DeviceLogEntry, DeviceLogType } from '@/features/device-log/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import {
  CassetteTapeIcon,
  CircleQuestionMarkIcon,
  MailIcon,
  PartyPopperIcon,
  PauseIcon,
  PlayIcon,
  PowerIcon,
  PowerOffIcon,
  Share2Icon,
  XCircleIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserBadge } from '@/entities/users/components'

export function LogPayload({ data }: { data: DeviceLogEntry }) {
  switch (data.type) {
    // case 'registered':
    // case 'unregistered':
    //   return null
    // case 'connected':
    // case 'disconnected':
    //   return null
    // case 'request_issued':
    // case 'request_acknowledged':
    //   return null
    // case 'session_started':
    // case 'session_ended':
    // case 'registered_session':
    //   return null
    case 'shared':
    case 'unshared':
      return <DeviceSharedPayload data={data.payload} type={data.type} />
  }
  if (!data.payload || Object.keys(data.payload).length === 0) {
    return null
  }
  return <pre>{data.payload ? JSON.stringify(data.payload, null, 2) : 'no payload'}</pre>
}

export namespace DeviceSharedPayload {
  export type Props = {
    type: DeviceLogType
    data: DeviceLogPayload<'shared' | 'unshared'>
  }
}

export const DeviceSharedPayload = ({ data, type }: DeviceSharedPayload.Props) => {
  if (!data.users || data.users.length === 0) {
    return <div>No users</div>
  }

  const action = type === 'shared' ? 'shared' : 'removed sharing'

  const links = data.users.map((user) => <UserBadge user={user} />)
  return (
    <p className="inline-flex items-center gap-2 text-muted-foreground text-sm">
      You {action} this device with {links}
    </p>
  )
}

// region icon

const icons: Record<DeviceLogType, LucideIcon> = {
  registered: PartyPopperIcon,
  unregistered: XCircleIcon,
  connected: PowerIcon,
  disconnected: PowerOffIcon,
  shared: Share2Icon,
  unshared: Share2Icon,
  request_issued: MailIcon,
  request_acknowledged: MailIcon,
  session_started: PlayIcon,
  session_ended: PauseIcon,
  registered_session: CassetteTapeIcon,
}

const colors: Record<DeviceLogType, string> = {
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

export function DeviceLogIcon({ data }: { data: DeviceLogEntry }) {
  const Icon = icons[data.type] || CircleQuestionMarkIcon

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={cn('grid place-items-center rounded-lg p-2', colors[data.type])}>
          {/* <BadgeIcon className='size-8 text-muted-foreground' strokeWidth={1.5}/> */}
          <Icon className={cn('size-4')} />
        </div>
      </TooltipTrigger>
      <TooltipContent>{data.type.replace('_', ' ')}</TooltipContent>
    </Tooltip>
  )
}
