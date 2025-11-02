import { useMemo } from 'react'
import dayjs from 'dayjs'
import Link from 'next/link'

import { ChevronDown, MapIcon } from 'lucide-react'

import type { Doc } from '@workspace/backend/dataModel'

import { Badge } from '@workspace/ui/components/badge'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@workspace/ui/components/collapsible'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { Button } from '@workspace/ui/components/button'

import { TimerBadge } from '@/components/timer-badge'

import { cn } from '@/lib/utils'
import { DeleteSessionButton } from './delete-session-button'

export namespace SessionTitle {
  export type Props = {
    session: Doc<'trackSession'>
    className?: string
  }
}

export const SessionTitle: React.FC<SessionTitle.Props> = (props) => {
  const { session, className } = props
  const start = useMemo(() => dayjs(session.startedAt), [session.startedAt])
  const end = useMemo(() => (session.endedAt ? dayjs(session.endedAt) : null), [session.endedAt])

  const started = useMemo(() => {
    const value = start.isSame(dayjs(), 'day')
      ? start.format('HH:mm')
      : start.format('YYYY-MM-DD HH:mm')
    return <span className="font-bold">{value}</span>
  }, [start])

  const ended = useMemo(() => {
    if (!end) return null
    const isSameDay = start.isSame(end, 'day')
    const value = isSameDay ? end.format('HH:mm') : end.format('YYYY-MM-DD HH:mm')
    return <span className="font-bold">{value}</span>
  }, [start, end])

  const duration = useMemo(() => {
    if (!end) return <TimerBadge label="active">{session._creationTime}</TimerBadge>
    const diff = end.diff(start)
    return (
      <Badge variant="secondary" className="min-w-[96px] text-xs">
        {dayjs.duration(diff).humanize()}
      </Badge>
    )
  }, [start, end, session])

  return (
    <h3 className={cn('inline-flex w-full items-center gap-0.5 text-start text-xs', className)}>
      from {started}
      {ended && <span>to</span>}
      {ended}
      {duration}
    </h3>
  )
}

export namespace SessionCollapsible {
  export type Props = {
    session: Doc<'trackSession'>
    mapLink?: React.ComponentProps<typeof Link>['href']
    children: React.ReactNode
    show?: {
      delete?: boolean
      status?: boolean
      mapLink?: boolean
    }
    title?: React.FC<SessionTitle.Props>
  }
}

const defaultShow: SessionCollapsible.Props['show'] = {
  delete: true,
  status: true,
  mapLink: true,
}

export const SessionCollapsible: React.FC<SessionCollapsible.Props> = (props) => {
  const { session, mapLink, children, show: _show = {}, title: Title = SessionTitle } = props
  const show = { ...defaultShow, ..._show }

  return (
    <Collapsible
      defaultOpen={isSessionOpen(session)}
      className={cn(
        'data-[state=open]:[&_[data-role=chevron]]:rotate-180',
        'data-[state=open]:[&>div>button]:rounded-b-none',
      )}
    >
      <ButtonGroup className="w-full">
        <CollapsibleTrigger
          asChild
          className={cn('flex flex-1', 'max-w-full overflow-x-auto overflow-y-hidden')}
        >
          <Button
            variant="outline"
            className={cn('inline-flex w-full cursor-pointer items-center gap-2 px-4')}
          >
            {/* collapse indicator */}
            <ChevronDown
              data-role="chevron"
              className="h-4 w-4 transition-transform duration-200 ease-in-out"
            />
            {/* activity icon */}
            {show.status && (
              <span
                className={cn(
                  'h-3 w-3 rounded',
                  isSessionOpen(session) ? 'bg-green-500' : 'bg-gray-500',
                )}
              />
            )}
            {/* dynamic title */}
            <Title session={session} />
          </Button>
        </CollapsibleTrigger>
        {show.mapLink && mapLink && (
          <Button size="icon" variant="default" asChild className="">
            <Link href={mapLink}>
              <MapIcon />
            </Link>
          </Button>
        )}
        {show.delete && <DeleteSessionButton session={session} size="icon" variant="destructive" />}
      </ButtonGroup>
      <CollapsibleContent className="space-y-4 rounded-b-lg border border-t-0 p-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function isSessionOpen(session: Doc<'trackSession'>) {
  // Open if session is active
  return !session.endedAt
}
