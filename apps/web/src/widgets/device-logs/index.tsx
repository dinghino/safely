import type { Id } from '@workspace/backend/types'
import dayjs from '@/lib/dayjs'

import { useDeviceLogs } from '@/features/device-log/hooks'
import { DeviceLogIcon, LogPayload } from './components'
import type { DeviceLogEntry } from '@/features/device-log/types'

export * from './components'

export function DeviceEventsLog({ deviceId }: { deviceId: Id<'devices'> }) {
  const eventsLog = useDeviceLogs(deviceId)
  return (
    <section className="">
      {eventsLog.map((entry) => (
        <article
          key={entry._id}
          className="flex flex-col gap-2 rounded-md p-2 py-2 transition hover:bg-muted/50"
        >
          <div className="inline-flex items-center justify-between gap-2">
            <div className='inline-flex items-center gap-2'>
              <DeviceLogIcon data={entry} />
                <h3 className="font-semibold">{entry.title}</h3>
            </div>
            <EventTimestamp entry={entry} />
          </div>
          <LogPayload data={entry} />
        </article>
      ))}
    </section>
  )
}

function EventTimestamp({ entry }: { entry: DeviceLogEntry }) {
  return (
    <span className="text-muted-foreground text-xs">
      {dayjs(entry._creationTime).format('YYYY-MM-DD HH:mm:ss')}
    </span>
  )
}
