import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'

export namespace SessionDuration {
  export type Props = {
    session: { startedAt: number; endedAt?: number }
  }
}
export function Duration({ session }: SessionDuration.Props) {
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
