import { useMemo } from 'react'
import { CirclePlayIcon, CircleStopIcon, ClockIcon, FootprintsIcon, GaugeIcon } from 'lucide-react'

import type { Id } from '@workspace/backend/types'

import { dayjs } from '@/lib/dayjs'
import * as gis from '@/lib/gis'
import { SmallWidget } from '@/components/small-widget'
import { useSession, useSessionData } from '@/features/device-tracking'
import { SpeedChart } from '@/widgets/sessions/speed-chart'
import { ElevationChart } from '@/widgets/sessions/elevation-chart'

type SessionData = ReturnType<typeof useSessionData>

export function SessionInfo({ sessionId }: { sessionId: Id<'trackSession'> }) {
  const session = useSession(sessionId)
  const data = useSessionData(sessionId)
  if (session === undefined || data === undefined) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col flex-wrap items-stretch gap-y-3 *:grow">
      <SmallWidget icon={CirclePlayIcon} label="Started At">
        <p className="space-x-1 text-clip text-xl">
          <span className="text-muted-foreground">
            {dayjs(session.startedAt).format('YYYY-MM-DD')}
          </span>
          <span className="font-bold">{dayjs(session.startedAt).format('HH:mm')}</span>
        </p>
      </SmallWidget>
      <SmallWidget icon={CircleStopIcon} label="Ended At">
        <p className="space-x-1 text-clip text-xl">
          <span className="text-muted-foreground">
            {dayjs(session.endedAt).format('YYYY-MM-DD')}
          </span>
          <span className="font-bold">{dayjs(session.endedAt).format('HH:mm')}</span>
        </p>
      </SmallWidget>
      {/* <SmallWidget icon={MapPinIcon} label="Points Count">
        <p className="text-clip font-bold text-xl">{session.pointsCount}</p>
      </SmallWidget> */}
      <SmallWidget icon={ClockIcon} label="Duration">
        <p className="text-clip font-bold text-xl">
          {dayjs(session.endedAt).diff(dayjs(session.startedAt), 'minute')} minutes
        </p>
      </SmallWidget>
      <SmallWidget icon={FootprintsIcon} label="Total Distance">
        <SessionDistance data={data} />
      </SmallWidget>
      {/* speed chart - temporary */}
      <div className="overflow-hidden rounded-md border border-muted-foreground/10 bg-muted">
        <div className="inline-flex items-center gap-4 p-2">
          <GaugeIcon className="size-6 text-muted-foreground" />
          <h3 className="font-medium text-sm">Speed Over Time</h3>
        </div>
        <SpeedChart data={data} />
      </div>
      <div className="overflow-hidden rounded-md border border-muted-foreground/10 bg-muted">
        <div className="inline-flex items-center gap-4 p-2">
          <GaugeIcon className="size-6 text-muted-foreground" />
          <h3 className="font-medium text-sm">Elevation Over Time</h3>
        </div>
        <ElevationChart data={data} />
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// temporary components
// todo: split or hooks or something
// todo: refactor backend to provide data directly

function SessionDistance({ data }: { data: SessionData }) {
  const distance = useTotalDistance(data)
  const value = useMemo(() => {
    // meters or km based on value
    if (distance < 1500) {
      return `${distance.toFixed(2)} meters`
    }
    return `${(distance / 1000).toFixed(2)} km`
  }, [distance])
  return <span className="text-clip font-bold text-xl">{value}</span>
}

function useTotalDistance(data: SessionData): number {
  return useMemo(() => {
    if (!data || data.length < 2) return 0
    const coordinates = data.filter((loc) => loc.coordinates).map((loc) => loc.coordinates!)
    return coordinates.reduce((total, coord, index, arr) => {
      if (index === 0) return 0
      const prevCoord = arr[index - 1]!
      return total + gis.distanceInMeters(prevCoord, coord)
    }, 0)
  }, [data])
}
