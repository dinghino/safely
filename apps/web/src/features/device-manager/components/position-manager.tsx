'use client'

import { useDeviceLocation } from "@/shared/hooks/use-device-location"
import { api } from "@workspace/backend/api"
import { Button } from "@workspace/ui/components/button"
import { useMutation } from "convex/react"
import { Loader2, RefreshCcw, ClockIcon } from "lucide-react"
import { useEffect } from "react"
import type { Device } from "../../../entities/device/types"

/**
 * Test component to handle device position and geospatial data with convex.
 * This should be automated in the component that handles device registration
 * and heartbeat.
 */
export function DevicePositionManager({ device }: { device: Device }) {
  const locator = useDeviceLocation({ watch: false })
  const updatePosition = useMutation(api.devices.updatePosition)
  useEffect(() => {
    if (!locator.location) return
    if (locator.timestamp === locator.previous.timestamp) return
    console.log('Location changed, updating position...', locator)
    // updatePosition({ deviceId: device._id, position: locator.location })
  }, [locator])

  const handleUpdate = () => {
    if (!locator.location) return
    updatePosition({ deviceId: device.deviceId, position: locator.location })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleUpdate} disabled={!locator.location}>
        Dispatch
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={locator.isLoading}
        onClick={locator.getCurrentLocation}
        className="size-8 p-0.5"
      >
        {locator.isLoading ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
        <span className="sr-only">Get location</span>
      </Button>
      <Button
        size="icon"
        variant={locator.isWatching ? 'destructive' : 'outline'}
        disabled={locator.isLoading}
        onClick={locator.toggleWatching}
        className="size-8 p-0.5"
        title={locator.isWatching ? 'Stop watching' : 'Start watching'}
      >
        <ClockIcon />
      </Button>
    </>
  )
}
