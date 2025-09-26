'use client'
import { useSelector } from '@xstate/react'
import { HeartPulseIcon } from 'lucide-react'
import { TimerBadge } from '@/components/timer-badge'
import { useHeartbeat } from './heartbeat'

export namespace LastHeartbeatTime {
  export type Props = Omit<TimerBadge.Props, 'children' | 'label'> & {}
}

export const LastHeartbeatTime: React.FC<LastHeartbeatTime.Props> = (props) => {
  const { actor } = useHeartbeat()
  const timestamp = useSelector(actor, (state) => state.context.lastHeartbeat)
  return (
    <TimerBadge {...props} label={<HeartPulseIcon />}>
      {timestamp ?? 'never'}
    </TimerBadge>
  )
}
