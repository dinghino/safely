'use client'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import { LabeledBadge } from './labeled-badge'
import { useTimer } from '@/shared/hooks/use-timer'

export namespace TimerBadge {
  export type Props = Omit<LabeledBadge.Props, 'children'> & {
    children: dayjs.ConfigType
    /**
     * Tick interval
     * @default 1 second
    */
    tick?: number
  }
}

/**
 * A badge that displays a timer counting up from a given date/time up to now
 * in a humanized format (e.g., "5 minutes ago", "2 hours ago").
 */
export const TimerBadge: React.FC<TimerBadge.Props> = (props) => {
  const { children, tick = 1000, ...rest } = props
  const value = useMemo(() => dayjs(children), [children])
  const now = useTimer({ tick, enabled: value.isValid() })
  const diff = dayjs(now).diff(dayjs(value))

  return <LabeledBadge {...rest}>{dayjs.duration(diff).humanize()}</LabeledBadge>
}
