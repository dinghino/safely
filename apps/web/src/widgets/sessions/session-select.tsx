import { useAllSessions } from '@/features/device-tracking'
import type { Doc, Id } from '@workspace/backend/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import dayjs from 'dayjs'
import { useMemo } from 'react'

export namespace SessionSelect {
  export type Props = {
    deviceId: Id<'devices'>
    onValueChange: (sessionId: Id<'trackSession'>) => void
    defaultValue?: Id<'trackSession'> | undefined
  }
}

export const SessionSelect: React.FC<SessionSelect.Props> = (props) => {
  const { deviceId, onValueChange, defaultValue } = props
  const sessions = useAllSessions(deviceId)

  const byDay = useGroupSessionsByDay(sessions)

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a session" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(byDay).map(([day, items]) => (
          <SelectGroup key={day}>
            <SelectLabel>{dayjs(day).format('MMMM D, YYYY')}</SelectLabel>
            {items.map((session) => (
              <SelectItem key={session._id} value={session._id}>
                <ItemLabel session={session} />
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function ItemLabel({ session }: { session: Doc<'trackSession'> }) {
  const start = dayjs(session.startedAt).format('HH:mm:ss')
  const end = session.endedAt ? dayjs(session.endedAt).format('HH:mm:ss') : 'Ongoing'
  return (
    <p className="truncate">
      {start} - {end}
    </p>
  )
}

/**
 * todo: move to backend query params
 * @see useAllSessions
 */
function useGroupSessionsByDay(sessions: Doc<'trackSession'>[] | null | undefined) {
  return useMemo(() => {
    if (!sessions) return {}
    return sessions?.reduce(
      (acc, session) => {
        const day = dayjs(session.startedAt).startOf('day').format('YYYY-MM-DD')
        if (!acc[day]) acc[day] = []
        acc[day].push(session)
        return acc
      },
      {} as Record<string, typeof sessions>,
    )
  }, [sessions])
}
