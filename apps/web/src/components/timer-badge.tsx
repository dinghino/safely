'use client'
import { useEffect, useMemo, useState } from 'react'
import { LabeledBadge } from './labeled-badge'
import dayjs from 'dayjs'

export namespace TimerBadge {
  export type Props = Omit<LabeledBadge.Props, 'children'> & {
    children: dayjs.ConfigType
    tick?: number
  }
}

export const TimerBadge: React.FC<TimerBadge.Props> = (props) => {
  const { children, tick = 1000, ...rest } = props
  const value = useMemo(() => dayjs(children), [children])
  const now = useTimer({ tick, enabled: value.isValid() })
  const diff = dayjs(now).diff(dayjs(value))

  return <LabeledBadge {...rest}>{dayjs.duration(diff).humanize()}</LabeledBadge>
}

type UseTimer = { tick?: number; enabled?: boolean }
const useTimer = ({ tick = 1000, enabled = true }: UseTimer) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => {
      setNow(Date.now())
    }, tick)
    return () => clearInterval(interval)
  }, [tick, enabled])

  return now
}
