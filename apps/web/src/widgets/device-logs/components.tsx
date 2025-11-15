import Link from 'next/link'

import { cn } from '@/lib/utils'

import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

import { UserBadge } from '@/entities/users/components'

import type { DeviceLogPayload, DeviceLogEntry } from '@/features/device-log/types'
import { useSessionData } from '@/features/device-tracking'
import { getEventColor, getEventIcon } from '@/features/device-log/lib'
import { Separator } from '@workspace/ui/components/separator'

export function LogPayload({ data }: { data: DeviceLogEntry }) {
  const component = <LogPayload_Inner data={data} />
  if (!component) {
    return null
  }
  return <div className="py-2">{component}</div>
}

export function LogPayload_Inner({ data }: { data: DeviceLogEntry }) {
  switch (data.type) {
    // case 'registered':
    // case 'unregistered':
    //   return null
    // case 'connected':
    // case 'disconnected':
    //   return null
    // case 'request_issued':
    // case 'request_acknowledged':
    //   return <span className="text-muted-foreground text-xs">Device acknowledged request</span>
    case 'session_started':
    case 'session_ended':
    case 'registered_session':
      return <SessionDataPayload data={data.payload} />
    case 'session_shared':
      return (
        <>
          <DeviceSharedPayload
            data={data.payload}
            title={(users) => <>Shared session with {users}</>}
          />
          <Separator className="my-1" />
          <SessionDataPayload data={data.payload} />
        </>
      )
    case 'shared':
      return (
        <DeviceSharedPayload
          data={data.payload}
          title={(users) => <>You shared this device with {users}</>}
        />
      )
    case 'unshared':
      return (
        <DeviceSharedPayload
          data={data.payload}
          title={(users) => <>Removed access to {users}</>}
        />
      )
  }
  if (!data.payload || Object.keys(data.payload).length === 0) {
    return null
  }
  // return <pre>{data.payload ? JSON.stringify(data.payload, null, 2) : 'no payload'}</pre>
}

// region payload elements

export namespace DeviceSharedPayload {
  export type Props = {
    data: DeviceLogPayload<'shared' | 'unshared'>
    title: (users: React.ReactElement[]) => React.ReactElement
  }
}

export const DeviceSharedPayload = (props: DeviceSharedPayload.Props) => {
  const { data, title } = props
  if (!data.users || data.users.length === 0) {
    return <div>No users</div>
  }

  const links = data.users.map((user) => <UserBadge user={user} />)
  return (
    <p className="inline-flex items-center gap-2 text-muted-foreground text-sm">{title(links)}</p>
  )
}

export namespace SessionDataPayload {
  export type Props = {
    data: DeviceLogPayload<'session_started' | 'session_ended' | 'registered_session'>
  }
}

export const SessionDataPayload = (props: SessionDataPayload.Props) => {
  const {
    data: { sessionId },
  } = props
  const session = useSessionData(sessionId)

  if (session === undefined) {
    return (
      <div className="inline-flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton className="h-4 w-20" key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          badge 1
        </Badge>
        <Badge variant="outline" className="text-xs">
          badge 2
        </Badge>
        <Badge variant="outline" className="text-xs">
          badge 3
        </Badge>
      </div>
      <div>
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/dashboard/sessions/${sessionId}`}>View Session</Link>
        </Button>
      </div>
    </div>
  )
}

// region icon

export namespace DeviceLogIcon {
  export type Props = {
    data: DeviceLogEntry
    className?: string
  }
}

export function DeviceLogIcon(props: DeviceLogIcon.Props) {
  const { data, className } = props
  const Icon = getEventIcon(data.type)
  const colors = getEventColor(data.type)

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={cn('grid place-items-center rounded-lg bg-muted p-2', colors, className)}>
          {/* <BadgeIcon className='size-8 text-muted-foreground' strokeWidth={1.5}/> */}
          <Icon className={cn('size-4')} />
        </div>
      </TooltipTrigger>
      <TooltipContent>{data.type.replace('_', ' ')}</TooltipContent>
    </Tooltip>
  )
}
