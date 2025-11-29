import Link from 'next/link'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

import { UserBadge } from '@/entities/users/components'

import type { DeviceLogPayload, DeviceLogEntry } from '@/features/device-log/types'
import { useSessionData } from '@/features/device-tracking'
import { Separator } from '@workspace/ui/components/separator'

/**
 * Renders the payload of a device log entry with appropriate components
 */
export function LogPayload({ data }: { data: DeviceLogEntry }) {
  const component = <LogPayload_Inner data={data} />
  if (!component) {
    return null
  }
  return <div className="py-2">{component}</div>
}

/**
 * Inner component to decide which payload to render
 */
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
      return <SessionSharedPayload data={data.payload} />
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

  const links = data.users.map((user) => <UserBadge key={user._id} user={user} />)
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

export namespace SessionSharedPayload {
  export type Props = {
    data: DeviceLogPayload<'session_shared'>
  }
}

export const SessionSharedPayload = (props: SessionSharedPayload.Props) => {
  const { data } = props
  return (
    <>
      <DeviceSharedPayload data={data} title={(users) => <>Shared session with {users}</>} />
      <Separator className="my-1" />
      <SessionDataPayload data={data} />
    </>
  )
}
