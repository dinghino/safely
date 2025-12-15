'use client'

import { useEffect, useMemo, useState } from 'react'
import { PowerOffIcon, HeartPulseIcon, HeartOffIcon, Trash2Icon } from 'lucide-react'
import { useSelector } from '@xstate/react'

import { Conditional } from '@workspace/react-utils'

import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { Card } from '@workspace/ui/components/card'

import { cn } from '@/lib/utils'
import dayjs from '@/lib/dayjs'

import { LabeledBadge } from '@/components/labeled-badge'

import { useHeartbeat, type HeartbeatManager } from './heartbeat'

export namespace HeartbeatDebugger {
  export type Props = {}
}
export const HeartbeatDebugger = () => {
  const { state, actor, send, status } = useHeartbeat()
  const context = useSelector(actor, (state) => state.context)
  const lastSent = useSelector(actor, (state) => state.context.lastHeartbeat)
  const interval = useSelector(actor, (state) => state.context.interval)

  return (
    <Card className="p-4">
      <ButtonGroup>
        <Conditional if={state.can({ type: 'stop' })}>
          <Button size="icon" onClick={() => send({ type: 'stop' })}>
            <HeartOffIcon />
          </Button>
        </Conditional>
        <Conditional if={state.can({ type: 'start' })}>
          <Button size="icon" onClick={() => send({ type: 'start' })}>
            <HeartPulseIcon />
          </Button>
        </Conditional>
        <Button
          size="icon"
          variant="destructive"
          disabled={!state.can({ type: 'disconnect' })}
          onClick={() => send({ type: 'disconnect' })}
        >
          <PowerOffIcon />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          disabled={!state.can({ type: 'clear' })}
          onClick={() => send({ type: 'clear' })}
        >
          <Trash2Icon />
        </Button>
      </ButtonGroup>
      <TimeRemaining actor={actor} />
      <div className="inline-flex flex-wrap items-center gap-2">
        <LabeledBadge label="device" variants={{ value: 'secondary' }}>
          <div
            className={cn('aspect-square h-2 w-2 flex-1 rounded bg-purple-500', {
              'bg-red-500': status === 'offline',
              'bg-green-500': status === 'online',
              'bg-gray-500': status === 'idle',
            })}
          />
        </LabeledBadge>
        <LabeledBadge label="machine" variants={{ value: 'secondary' }}>
          {JSON.stringify(state.value)}
        </LabeledBadge>
        <LabeledBadge label="every">
          {interval ? dayjs.duration(interval).humanize() : 'n/a'}
        </LabeledBadge>
        <LabeledBadge label="last sent" variants={{ value: 'secondary' }}>
          {lastSent ? dayjs(lastSent).format('HH:mm:ss') : 'never'}
        </LabeledBadge>
      </div>
      <div>
        <pre>{JSON.stringify(context, null, 2)}</pre>
      </div>
    </Card>
  )
}

const TimeRemaining = ({ actor }: { actor: HeartbeatManager.Actor }) => {
  const interval = useSelector(actor, (s) => s.context.interval)
  const lastHeartbeat = useSelector(actor, (s) => s.context.lastHeartbeat)
  const isStopped = useSelector(actor, (s) => s.matches('stopped'))

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!interval || isStopped) return
    // Update timer every second
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [interval, isStopped])

  useEffect(() => {
    const set = () => setNow(Date.now())
    // Reset progress when interval changes or heartbeat occurs
    const changed = actor.on('intervalChanged', set)
    const sent = actor.on('heartbeat', set)
    const reset = actor.on('stopped', set)
    const start = actor.on('started', set)
    return () => {
      changed.unsubscribe()
      sent.unsubscribe()
      reset.unsubscribe()
      start.unsubscribe()
    }
  }, [actor])

  const value = useMemo(() => {
    if (isStopped) return 0
    if (!interval || !lastHeartbeat) return 0

    const elapsed = now - lastHeartbeat
    const progress = Math.min((elapsed / interval) * 100, 100)

    return Math.max(progress, 0)
  }, [now, lastHeartbeat, interval, isStopped])

  return (
    <div className="px-1">
      <Progress value={value} className="h-1" />
    </div>
  )
}
