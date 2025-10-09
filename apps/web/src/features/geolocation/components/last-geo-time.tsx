'use client'
import { MapPinCheckInside } from 'lucide-react'
import { useGeolocationContext } from '../context/geolocation-context'
import { TimerBadge } from '@/components/timer-badge'
import { Spinner } from '@workspace/ui/components/spinner'

export namespace LastGeoTime {
  export type Props = Omit<TimerBadge.Props, 'children' | 'label'> & {}
}

export const LastGeoTime: React.FC<LastGeoTime.Props> = (props) => {
  const { timestamp, state } = useGeolocationContext()

  const querying = state.matches('requestingLocation')

  return (
    <TimerBadge {...props} label={querying ? <Spinner /> : <MapPinCheckInside />}>
      {querying ? 'querying...' : (timestamp ?? 'never')}
    </TimerBadge>
  )
}
