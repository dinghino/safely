'use client'

/**
 * This is a prototype client page for managing a device's sessions and logging
 * a tracking sessions and data. it needs to be split into proper components
 * spanning features and other layers.
 * 
 * Most of it is going to be removed completely once we have mapping, probably.
 */

import { api } from '@workspace/backend/api'
import type { Doc, Id } from '@workspace/backend/dataModel'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@workspace/ui/components/collapsible'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DeviceName, DeviceStatusBadge } from '@/entities/device/components'
import { useDeviceInfo, useIsCurrent } from '@/features/device-manager/hooks'
import dayjs from '@/lib/dayjs'
import { useDeviceLocation } from '@/shared/hooks/use-device-location'
import { ChevronDown, Trash2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

function isSessionOpen(session?: { endedAt?: number }) {
  return session && !session.endedAt
}

function isSessionClosed(session?: { endedAt?: number }) {
  return session && !!session.endedAt
}

export function DevicePageClient({ deviceId }: { deviceId: string }) {
  const device = useQuery(api.devices.getDevice, { deviceId })
  const isDevice = useIsCurrent({ device })

  const session = useQuery(api.tracking.getActiveSession, { deviceId: device?._id })

  const sessions = useQuery(api.tracking.getDeviceSessions, { deviceId: device?._id }) ?? []

  const startSession = useMutation(api.tracking.startSession)
  const stopSession = useMutation(api.tracking.stopSession)

  if (!device) return <div>Device not found</div>

  const handleSession = async () => {
    if (session && !session.endedAt) return stopSession({ sessionId: session._id })
    await startSession({ deviceId: device._id })
  }

  const btnText = session && !session?.endedAt ? 'Stop Session' : 'Start Session'

  return (
    <div className="flex flex-row flex-nowrap gap-4 p-4 max-md:flex-col">
      <aside className="@container flex w-full flex-col gap-4 rounded-lg bg-card p-4 max-md:h-fit max-md:flex-row max-md:justify-between min-md:max-w-[300px]">
        <div className="flex items-center gap-2">
          <DeviceStatusBadge device={device} />
          <DeviceName device={device} />
        </div>
        {isDevice && (
          <div className="flex flex-col items-center gap-2">
            <Button variant="default" className="w-full" onClick={handleSession}>
              {btnText}
            </Button>
            {session && isSessionOpen(session) && <SessionUpdater session={session} />}
          </div>
        )}
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
        'data-[state=open]:[&_button]:rounded-b-none',
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
          {/* <Button variant="secondary" className="w-full justify-between"> */}
          <h3 className="text-start font-bold">Session {session._id}</h3>
          <ChevronDown data-role="chevron" className="h-4 w-4 transition-transform duration-200 ease-in-out" />
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
      <CollapsibleContent className="rounded-b-lg border border-t-0 p-2">
        <p>Started at {dayjs(session.startedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
        {session.endedAt && <p>Ended at {dayjs(session.endedAt).format('YYYY-MM-DD HH:mm:ss')}</p>}
        <p>
          Duration: <Duration session={session} />
        </p>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <div className="p-2">
          <SessionData sessionId={session._id} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SessionData({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const data = useQuery(api.tracking.getSessionLocations, { sessionId })
  if (!data) return <div>Loading session data...</div>
  if (data.length === 0) return <div>No location data for this session</div>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

/**
 * Stub for future session updater component
 */
function SessionUpdater({ session }: { session: Doc<'trackSession'> }) {
  const update = useMutation(api.tracking.addLocationPoint)

  const sendLocationUpdate = useCallback(
    async (location: GeolocationPosition | null) => {
      const sessionId = session._id
      if (!location) return
      if (!sessionId || isSessionClosed(session)) return
      const { latitude, longitude } = location.coords

      await update({
        sessionId,
        point: { latitude, longitude },
        metadata: {
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude ?? undefined,
          altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
          heading: location.coords.heading ?? undefined,
          speed: location.coords.speed ?? undefined,
        },
      })
    },
    [session, update],
  )
  const locator = useDeviceLocation({
    watch: true,
    enableHighAccuracy: true,
    timeout: 10_000,
    onSuccess: sendLocationUpdate,
  })

  // handle updating watching state when session state changes
  useEffect(() => {
    if (locator.isWatching && isSessionClosed(session)) locator.stopWatching()
    if (!locator.isWatching && isSessionOpen(session)) locator.startWatching()
  }, [locator, session])
  return null
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
