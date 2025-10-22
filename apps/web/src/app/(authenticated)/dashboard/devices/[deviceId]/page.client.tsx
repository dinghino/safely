'use client'

/**
 * This is a prototype client page for managing a device's sessions and logging
 * a tracking sessions and data. it needs to be split into proper components
 * spanning features and other layers.
 *
 * Most of it is going to be removed completely once we have mapping, probably.
 */

import { Suspense, useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/api'
import type { Doc, Id } from '@workspace/backend/dataModel'
import { Badge } from '@workspace/ui/components/badge'

import dayjs from '@/lib/dayjs'

import { DeviceName, DeviceStatusBadge } from '@/entities/device/components'
import { SessionLocationsTable } from '@/widgets/geospatial-table'
import { SessionButton } from '@/features/device-tracking'
import { SessionMap } from '@/views/session-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Duration, SessionCollapsible } from '@/widgets/sessions'

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
  return (
    <SessionCollapsible
      session={session}
      mapLink={{ pathname: `/dashboard/sessions/${session._id}/map` }}
    >
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
    </SessionCollapsible>
  )
}

function SessionDataTable({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const data = useQuery(api.tracking.locations.getSession, { sessionId })
  if (!data) return <div>Loading session data...</div>
  if (data.length === 0) return <div>No location data for this session</div>
  return <SessionLocationsTable locations={data} />
  // return <pre>{JSON.stringify(data, null, 2)}</pre>
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
