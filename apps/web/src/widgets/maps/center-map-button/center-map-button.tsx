'use client'

import { useCallback, useEffect, useTransition } from 'react'
import { useMap } from 'react-leaflet'
import { LocateIcon } from 'lucide-react'

import type { Locator } from '@workspace/geolocation/types'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'

import { useGeolocationContext } from '@/features/geolocation'
import { cn } from '@/lib/utils'

export namespace CenterMapButton {
  export type Props = {
    /**
     * whether to trigger centering the map as soon as the component is mounted
     */
    autoCenter?: boolean
  } & Omit<React.ComponentProps<typeof Button>, 'children' | 'onClick' | 'disabled'>
}

/**
 * Centers the current map on the user's location using the internal
 * geolocation context.
 *
 * @note
 * This has the side effect of updating the global device current location and
 * may also trigger updates for heartbeat and active sessions dispatch if present.
 * @todo add LocateFixedIcon when map is centered on user location
 *       user context.current for last known location
 * @todo we might want to use watchPosition to keep things up to date when
 *       showing the map
 */
export const CenterMapButton: React.FC<CenterMapButton.Props> = (_props) => {
  const { autoCenter = false, ...props } = _props
  const { getLocation, state, actor } = useGeolocationContext()
  const map = useMap()

  const canLocate = state.can({ type: 'GET_POSITION' })
  const querying = state.matches('requestingLocation')

  const [loading, startRequest] = useTransition()

  const requestPosition = useCallback(async () => {
    return new Promise<Locator.Data>((resolve) => {
      const subscription = actor.on('LOCATION_UPDATE', ({ data }) => {
        subscription.unsubscribe()
        resolve(data)
      })

      getLocation({ enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 })
    })
  }, [actor, getLocation])

  const handleClick = useCallback(
    async () =>
      startRequest(async () => {
        const data = await requestPosition()
        const { latitude, longitude } = data.point
        map.setView([latitude, longitude], map.getZoom())
      }),
    [map, requestPosition],
  )

  const disabled = !canLocate || loading || querying
  const Icon = querying || loading ? Spinner : LocateIcon

  useEffect(() => {
    if (!autoCenter) return
    // console.log('Auto-centering map on user location')
    handleClick()
  }, [autoCenter])

  return (
    <Button
      size="sm"
      title="Center map on your location"
      {...props}
      onClick={handleClick}
      disabled={disabled}
      className={cn('leaflet-control', props.className)}
    >
      <Icon />
    </Button>
  )
}
