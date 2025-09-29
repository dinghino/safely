'use client'

/**
 * This is a prototype client page for managing a device's sessions and logging
 * a tracking sessions and data. it needs to be split into proper components
 * spanning features and other layers.
 *
 * Most of it is going to be removed completely once we have mapping, probably.
 */

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ChevronDown, Trash2Icon } from 'lucide-react'

import { api } from '@workspace/backend/api'
import type { Doc, Id } from '@workspace/backend/dataModel'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@workspace/ui/components/collapsible'
import { Badge } from '@workspace/ui/components/badge'

import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'

import { DeviceName, DeviceStatusBadge } from '@/entities/device/components'
import { SessionLocationsTable } from '@/widgets/geospatial-table'
import { SessionButton } from '@/features/device-tracking'

function isSessionOpen(
  session: { endedAt?: number } | null | undefined,
): session is Doc<'trackSession'> {
  return !!session && !session.endedAt
}

export function DevicePageClient({ deviceId }: { deviceId: string }) {
  // fixme: this is ugly but need for a quick deployment test. this whole page is going to go anyway
  const device = useQuery(api.devices.get, { deviceId }) ?? undefined

  const active = useQuery(api.tracking.getActiveSession, { deviceId: device?._id })
  const sessions = useQuery(api.tracking.getDeviceSessions, { deviceId: device?._id }) ?? []

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
                interval {dayjs.duration(device?.settings.updateIntervalMs).humanize()}
              </Badge>
            </div>
          )}
          <SessionButton variant={btnVariant} deviceId={device._id} />
          {/* <Button variant={btnVariant} onClick={handleSession}>
            {btnText}
          </Button> */}

          {/* {session && isSessionOpen(session) && <SessionUpdater session={session} />} */}
        </div>
      </aside>
      <main className="flex-1">
        {/* <div className="border"> */}
        <h2 className="p-4 font-bold">Sessions ({sessions.length})</h2>
        <div className="divide-y">
          {sessions.map((s) => (
            <div key={s._id} className="p-2">
              <SessionItem session={s} />
            </div>
          ))}
        </div>
        {/* </div> */}
      </main>
    </div>
  )
}

function SessionItem({ session }: { session: Doc<'trackSession'> }) {
  const deleteSession = useMutation(api.tracking.deleteSession)
  return (
    <Collapsible
      defaultOpen={isSessionOpen(session)}
      className={cn(
        'data-[state=open]:[&_[data-role=chevron]]:rotate-180',
        'data-[state=open]:[&>div>button]:rounded-b-none',
      )}
    >
      <div className="inline-flex w-full">
        <CollapsibleTrigger
          className={cn(
            buttonVariants({ variant: 'outline', size: 'default' }),
            'flex flex-1 items-center justify-between',
            'rounded-r-none',
          )}
        >
          <div className="inline-flex items-center gap-2">
            <span
              className={cn(
                'h-3 w-3 rounded',
                isSessionOpen(session) ? 'bg-green-500' : 'bg-gray-500',
              )}
            />
            {/* <Button variant="secondary" className="w-full justify-between"> */}
            <h3 className="text-start font-bold">Session {session._id}</h3>
          </div>
          <ChevronDown
            data-role="chevron"
            className="h-4 w-4 transition-transform duration-200 ease-in-out"
          />
          {/* </Button> */}
        </CollapsibleTrigger>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-l-none"
          disabled={isSessionOpen(session)}
          onClick={() => deleteSession({ sessionId: session._id })}
        >
          <Trash2Icon />
        </Button>
      </div>
      <CollapsibleContent className="space-y-4 rounded-b-lg border border-t-0 p-2">
        <header className="space-y-1 rounded-lg bg-card p-2">
          <p>Started at {dayjs(session.startedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          {session.endedAt && (
            <p>Ended at {dayjs(session.endedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          )}
          <div className="inline-flex items-center gap-2">
            <Badge>
              Duration <Duration session={session} />
            </Badge>
            <Badge>Points {session.pointsCount}</Badge>
          </div>
        </header>
        {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
        <SessionData sessionId={session._id} />
      </CollapsibleContent>
    </Collapsible>
  )
}

function SessionData({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const data = useQuery(api.tracking.getSessionLocations, { sessionId })
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

function UpdatedTimer({ session }: { session: Doc<'trackSession'> }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  if (!session.lastUpdatedAt) return <span>never</span>
  return <span>{dayjs.duration(now - session.lastUpdatedAt).format('mm:ss')}</span>
}

////////////////////////////////////////////////////////////////////////////

/**
 * Stub for future session updater component
 */
// function SessionUpdater({ session }: { session: Doc<'trackSession'> }) {
//   const update = useMutation(api.tracking.addLocationPoint)

//   const sendLocationUpdate = useCallback(
//     async (location: GeolocationPosition | null) => {
//       const sessionId = session._id
//       if (!location) return
//       if (!sessionId || isSessionClosed(session)) return
//       const { latitude, longitude } = location.coords

//       await update({
//         sessionId,
//         point: { latitude, longitude },
//         metadata: {
//           accuracy: location.coords.accuracy,
//           altitude: location.coords.altitude ?? undefined,
//           altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
//           heading: location.coords.heading ?? undefined,
//           speed: location.coords.speed ?? undefined,
//         },
//       })
//     },
//     [session, update],
//   )
//   const locator = useDeviceLocation({
//     watch: true,
//     enableHighAccuracy: true,
//     timeout: 10_000,
//     onSuccess: sendLocationUpdate,
//   })

//   // handle updating watching state when session state changes
//   useEffect(() => {
//     if (locator.isWatching && isSessionClosed(session)) locator.stopWatching()
//     if (!locator.isWatching && isSessionOpen(session)) locator.startWatching()
//   }, [locator, session])
//   return null
// }
