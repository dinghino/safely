'use client'

import { api } from '@safely/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { dayjs } from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import { useDeviceInfo } from '../hooks'

/**
 * Simple list view for user registered devices
 */
export function DevicesList() {
  const local = useDeviceInfo()

  const devices = useQuery(api.devices.getAll)
  const unregister = useMutation(api.devices.deleteDevice)

  function isCurrent(device: { deviceId: string }) {
    return device.deviceId === local.deviceId
  }
  async function handleUnregister(device: NonNullable<typeof devices>[number]) {
    await unregister({ id: device._id })
    // if (isCurrent(device)) removeId()
  }

  return (
    <ul className="space-y-2">
      {devices?.map((device) => (
        <li
          key={device.deviceId}
          className={cn(
            isCurrent(device) && 'font-bold',
            'flex items-center justify-between gap-2',
          )}
        >
          <div className="inline-flex items-center gap-2">
            <div
              className={cn(
                'size-2 rounded-full',
                // if time since last_seen < 15 seconds, green, else gray
                // use dayjs to compare
                dayjs().diff(dayjs(device.last_seen), 'second') < 15
                  ? 'bg-green-500'
                  : 'bg-gray-500',
              )}
            />
            <span>{device.name ?? device.deviceId}</span>
            <span>{device.platform}</span>
            {/* {isCurrent(device) && (
              <span className="text-muted-foreground text-xs">(this device)</span>
            )} */}
            {isCurrent(device) && <Badge variant="secondary">this device</Badge>}
          </div>
          <div className="inline-flex items-center gap-2">
            <span>{dayjs(device.last_seen).format()}</span>
            <Button
              size="icon"
              onClick={() => handleUnregister(device)}
              // disabled={isCurrent(device)}
            >
              <Trash2 />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
