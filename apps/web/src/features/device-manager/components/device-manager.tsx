'use client'
import { useCallback, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Trash2 } from 'lucide-react'

import { api } from '@safely/backend/convex/_generated/api'

import { cn } from '@/lib/utils'
import { dayjs } from '@/lib/dayjs'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDeviceInfo } from '../hooks'

export const DeviceManager = () => {
  const deviceInfo = useDeviceInfo()
  const devices = useQuery(api.devices.getAll)
  const register = useMutation(api.devices.registerDevice)
  const unregister = useMutation(api.devices.deleteDevice)

  const heartbeat = useCallback(async () => {
    const { deviceId, platform } = deviceInfo
    if (!deviceId) return
    await register({ deviceId, platform })
  }, [deviceInfo, register])

  useEffect(() => {
    const interval = setInterval(heartbeat, 10000) // every 10 seconds
    heartbeat() // initial call
    return () => clearInterval(interval)
  }, [heartbeat])

  function isCurrent(device: { deviceId: string }) {
    return device.deviceId === deviceInfo.deviceId
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
