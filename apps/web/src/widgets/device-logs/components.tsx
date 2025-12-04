import Link from 'next/link'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { UserBadge } from '@/entities/users/components'

import { useSessionMetadata } from '@/features/device-tracking'
import { Separator } from '@workspace/ui/components/separator'
import type { DeviceActivityLog, DeviceLogPayload } from '@workspace/backend/types'
import dayjs from 'dayjs'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { LabeledBadge } from '@/components/labeled-badge'
import { useMemo } from 'react'

/**
 * Renders the payload of a device log entry with appropriate components
 */
export function LogPayload({ data }: { data: DeviceActivityLog }) {
  const component = <LogPayload_Inner data={data} />
  if (!component) {
    return null
  }
  return <div className="py-2">{component}</div>
}

/**
 * Inner component to decide which payload to render
 */
export function LogPayload_Inner({ data }: { data: DeviceActivityLog }) {
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
    case 'renamed':
      return (
        <span className="text-muted-foreground text-sm">
          Name changed from <strong>{data.payload.previousName}</strong> to{' '}
          <strong>{data.payload.newName}</strong>
        </span>
      )
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
  const data = useSessionMetadata(sessionId)
  const distance = useMemo(() => {
    // meters or km based on value
    const distance = data?.distance
    if (!distance) return null
    if (distance < 1500) {
      return `${distance.toFixed(2)} meters`
    }
    return `${(distance / 1000).toFixed(2)} km`
  }, [data])

  if (data === undefined) {
    return (
      <div className="inline-flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton className="h-4 w-20" key={i} />
        ))}
      </div>
    )
  }

  if (!data) {
    return <div>Session data not found</div>
  }
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2">
        {/* <ButtonGroup> */}
        <Button size="sm" variant="secondary" asChild className="py-0!">
          <Link href={`/dashboard/sessions/${sessionId}`}>View Session</Link>
        </Button>
        {/* </ButtonGroup> */}
        <LabeledBadge label="Distance">{distance}</LabeledBadge>
        <LabeledBadge label="Duration">
          {dayjs.duration(data.duration, 'ms').humanize()}
        </LabeledBadge>
        {/* </div>
      <div> */}
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
