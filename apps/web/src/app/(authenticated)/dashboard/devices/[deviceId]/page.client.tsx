'use client'

/**
 * This is a prototype client page for managing a device's sessions and logging
 * a tracking sessions and data. it needs to be split into proper components
 * spanning features and other layers.
 *
 * Most of it is going to be removed completely once we have mapping, probably.
 */

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { ChevronDown, MapIcon } from 'lucide-react'

import { api } from '@workspace/backend/api'
import type { Doc, Id } from '@workspace/backend/dataModel'
import { Button } from '@workspace/ui/components/button'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@workspace/ui/components/collapsible'
import { Badge } from '@workspace/ui/components/badge'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { DeleteDialogButton } from '@workspace/ui/components/delete-dialog-button'

import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'

import { TimerBadge } from '@/components/timer-badge'

import { DeviceName, DeviceStatusBadge } from '@/entities/device/components'
import { SessionLocationsTable } from '@/widgets/geospatial-table'
import { SessionButton } from '@/features/device-tracking'
import { SessionMap } from '@/views/session-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'

function isSessionOpen(
  session: { endedAt?: number } | null | undefined,
): session is Doc<'trackSession'> {
  return !!session && !session.endedAt
}

export function DevicePageClient({ deviceId }: { deviceId: Id<'devices'> }) {
  // fixme: this is ugly but need for a quick deployment test. this whole page is going to go anyway
  const device = useQuery(api.devices.get.one, { deviceId }) ?? undefined

  const active = useQuery(api.tracking.sessions.getActive, { deviceId: device?._id })
  const sessions = useQuery(api.tracking.sessions.getAllOfDevice, { deviceId: device?._id }) ?? []

  if (!device) return <div>Device not found</div>

  const btnVariant = isSessionOpen(active) ? 'destructive' : 'default'

  return (
    <div className="py-4 content-grid">
      <aside className="@container flex h-fit w-full flex-row justify-between gap-4 rounded-lg bg-card p-4">
        <div className="flex items-center gap-2">
          <DeviceStatusBadge device={device} label={false} />
          <DeviceName device={device} />
        </div>
        <div className="flex items-center gap-2">
          {isSessionOpen(active) && (
            <div className="flex flex-col items-stretch gap-1 [&>span]:w-full">
              {active.lastUpdatedAt && (
                <Badge variant={'secondary'}>
                  updated <UpdatedTimer session={active} />
                </Badge>
              )}
              <Badge variant="secondary">
                interval {dayjs.duration(device?.settings.location.timeout).humanize()}
              </Badge>
            </div>
          )}
          <SessionButton variant={btnVariant} deviceId={device._id} />
        </div>
      </aside>
      <main className="flex-1">
        {/* <div className="border"> */}
        <h2 className="p-4 font-bold">Sessions ({sessions.length})</h2>
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            // <div key={s._id} className="p-2">
            <SessionItem session={s} key={s._id} />
            // </div>
          ))}
        </div>
        {/* </div> */}
      </main>
    </div>
  )
}

function SessionItem({ session }: { session: Doc<'trackSession'> }) {
  const deleteSession = useMutation(api.tracking.sessions.remove)
  return (
    <Collapsible
      defaultOpen={isSessionOpen(session)}
      className={cn(
        'data-[state=open]:[&_[data-role=chevron]]:rotate-180',
        'data-[state=open]:[&>div>button]:rounded-b-none',
      )}
    >
      <ButtonGroup className="w-full">
        <CollapsibleTrigger
          asChild
          className={cn('flex flex-1', 'max-w-full overflow-x-auto overflow-y-hidden')}
        >
          <Button
            variant="outline"
            className={cn('inline-flex w-full cursor-pointer items-center gap-2 px-4')}
          >
            {/* collapse indicator */}
            <ChevronDown
              data-role="chevron"
              className="h-4 w-4 transition-transform duration-200 ease-in-out"
            />
            {/* activity icon */}
            <span
              className={cn(
                'h-3 w-3 rounded',
                isSessionOpen(session) ? 'bg-green-500' : 'bg-gray-500',
              )}
            />
            {/* dynamic title */}
            <SessionTitle session={session} />
          </Button>
        </CollapsibleTrigger>
        <Button size="icon" variant="default" asChild className="">
          <Link href={{ pathname: `/dashboard/sessions/${session._id}/map` }}>
            <MapIcon />
          </Link>
        </Button>
        <DeleteDialogButton
          title="Delete Session"
          description="Are you sure you want to delete this session? This action cannot be undone."
          confirmText="Delete"
          className="cursor-pointer"
          disabled={session.endedAt === undefined}
          onClick={async () => {
            await deleteSession({ sessionId: session._id })
          }}
        />
      </ButtonGroup>
      <CollapsibleContent className="space-y-4 rounded-b-lg border border-t-0 p-2">
        <header className="inline-flex w-full items-start justify-between rounded-lg bg-card p-2">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs">
              Started at {dayjs(session.startedAt).format('YYYY-MM-DD HH:mm:ss')}
            </p>
            {session.endedAt && (
              <p className="font-mono text-xs">
                Ended at {dayjs(session.endedAt).format('YYYY-MM-DD HH:mm:ss')}
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-2">
            <Badge>
              Duration <Duration session={session} />
            </Badge>
            <Badge>Points {session.pointsCount}</Badge>
          </div>
        </header>
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="data">Data View</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <div className="h-full max-h-[600px] flex-1 overflow-hidden rounded-lg">
              <Suspense fallback={<div>Loading map...</div>}>
                <SessionMap sessionId={session._id} />
              </Suspense>
            </div>
          </TabsContent>
          <TabsContent value="data">
            <SessionDataTable sessionId={session._id} />
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SessionDataTable({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const data = useQuery(api.tracking.locations.getSession, { sessionId })
  if (!data) return <div>Loading session data...</div>
  if (data.length === 0) return <div>No location data for this session</div>
  return <SessionLocationsTable locations={data} />
  // return <pre>{JSON.stringify(data, null, 2)}</pre>
}

function Duration({ session }: { session: { startedAt: number; endedAt?: number } }) {
  const start = useMemo(() => dayjs(session.startedAt), [session.startedAt])
  const end = useMemo(() => (session.endedAt ? dayjs(session.endedAt) : null), [session.endedAt])

  const [diff, setDiff] = useState(end ? end.diff(start) : dayjs().diff(start))

  useEffect(() => {
    if (session.endedAt) return

    const interval = setInterval(() => setDiff(dayjs().diff(start)), 10_000)
    return () => clearInterval(interval)
  }, [session.endedAt, start])

  return <span>{dayjs.duration(diff).humanize()}</span>
  // return <span>{dayjs.duration(diff).format('HH:mm:ss')}</span>
}

function SessionTitle({ session }: { session: Doc<'trackSession'> }) {
  const start = useMemo(() => dayjs(session.startedAt), [session.startedAt])
  const end = useMemo(() => (session.endedAt ? dayjs(session.endedAt) : null), [session.endedAt])

  const started = useMemo(() => {
    const value = start.isSame(dayjs(), 'day')
      ? start.format('HH:mm')
      : start.format('YYYY-MM-DD HH:mm')
    return <span className="font-bold">{value}</span>
  }, [start])

  const ended = useMemo(() => {
    if (!end) return null
    const isSameDay = start.isSame(end, 'day')
    const value = isSameDay ? end.format('HH:mm') : end.format('YYYY-MM-DD HH:mm')
    return <span className="font-bold">{value}</span>
  }, [start, end])

  const duration = useMemo(() => {
    if (!end) return <TimerBadge label="active">{session._creationTime}</TimerBadge>
    const diff = end.diff(start)
    return (
      <Badge variant="secondary" className="min-w-[96px] text-xs">
        {dayjs.duration(diff).humanize()}
      </Badge>
    )
  }, [start, end, session])

  return (
    <h3 className="inline-flex w-full items-center gap-0.5 text-start text-xs">
      from {started}
      {ended && <span>to</span>}
      {ended}
      {duration}
    </h3>
  )
}

function UpdatedTimer({ session }: { session: Doc<'trackSession'> }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  if (!session.lastUpdatedAt) return <span>never</span>
  return <span>{dayjs.duration(now - session.lastUpdatedAt).format('mm:ss')}</span>
}
