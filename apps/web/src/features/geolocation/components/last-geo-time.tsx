'use client'
import { MapPinCheckInside } from 'lucide-react'
import { useGeolocationContext } from '../context/geolocation-context'
import { TimerBadge } from '@/components/timer-badge'

export namespace LastGeoTime {
  export type Props = Omit<TimerBadge.Props, 'children' | 'label'> & {}
}

export const LastGeoTime: React.FC<LastGeoTime.Props> = (props) => {
  const { timestamp } = useGeolocationContext()
  return (
    <TimerBadge {...props} label={<MapPinCheckInside />}>
      {timestamp ?? 'never'}
    </TimerBadge>
  )
}
