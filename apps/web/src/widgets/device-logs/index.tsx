import type { Id } from '@workspace/backend/types'
import dayjs from '@/lib/dayjs'

import { cn } from '@/lib/utils'
import { useDeviceLogs } from '@/features/device-log/hooks'
import type { DeviceLogEntry } from '@/features/device-log/types'
import { DeviceEventIcon } from '@/features/device-log/components'
import { LogPayload } from './components'

export * from './components'

export function DeviceEventsLog({ deviceId }: { deviceId: Id<'devices'> }) {
  const events = useDeviceLogs(deviceId)

  return (
    <section
      className={cn(
        // 'space-y-4',
        // '**:outline **:outline-red-500/10'
      )}
    >
      {events.map((entry, index) => (
        <article key={entry._id} className={cn('group flex gap-4')}>
          <div className="relative flex flex-col items-center">
            <div className="inline-flex min-h-10 w-10 flex-0 items-center justify-center">
              <DeviceEventIcon data={entry} className="" />
            </div>
            <Line index={index} count={events.length} />
          </div>

          <div className="flex-1 rounded-md px-2">
            {/* height is to make it level with the icon */}
            <header className={cn('flex h-10 items-center justify-between gap-2')}>
              <h4 className="font-medium leading-none">{entry.title}</h4>
              <time className="whitespace-nowrap text-muted-foreground text-xs">
                <EventTimestamp entry={entry} relative />
              </time>
            </header>
            <LogPayload data={entry} />
          </div>
        </article>
      ))}
    </section>
  )
}

function Line({ index, count }: { index: number; count: number }) {
  if (index >= count - 1) return null

  return <div className="mt-1 h-full min-h-4 w-px bg-border" />
}

function EventTimestamp({ entry, relative }: { entry: DeviceLogEntry; relative?: boolean }) {
  const time = dayjs(entry._creationTime)
  const formatted = relative ? time.fromNow() : time.format('YYYY-MM-DD HH:mm:ss')
  return <span className="text-muted-foreground text-xs">{formatted}</span>
}
