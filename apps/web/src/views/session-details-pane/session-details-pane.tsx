import { useMemo } from 'react'
import {
  CirclePlayIcon,
  CircleStopIcon,
  MapPinIcon,
  ClockIcon,
  FootprintsIcon,
  GaugeIcon,
} from 'lucide-react'

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
        <p className="text-sm">{dayjs(session.startedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
      </SmallWidget>
      <SmallWidget icon={CircleStopIcon} label="Ended At">
        <p className="text-sm">{dayjs(session.endedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
      </SmallWidget>
      <SmallWidget icon={MapPinIcon} label="Points Count">
        <p className="text-sm">{session.pointsCount}</p>
      </SmallWidget>
      {/* duration */}
      <SmallWidget icon={ClockIcon} label="Duration">
        <p className="text-sm">
          {dayjs(session.endedAt).diff(dayjs(session.startedAt), 'minute')} minutes
        </p>
      </SmallWidget>
      <SmallWidget icon={FootprintsIcon} label="Total Distance">
        <SessionDistance data={data} />
      </SmallWidget>
    </div>
  )
}

// ----------------------------------------------------------------------------
// temporary components
// todo: split or hooks or something
// todo: refactor backend to provide data directly

function SessionDistance({ data }: { data: SessionData }) {
  const distance = useTotalDistance(data)
  return <span>{distance.toFixed(2)} meters</span>
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
