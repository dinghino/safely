'use client'

import { formatLatLng } from '@/entities/location/lib/format-lat-lng'
import { useGeolocationContext } from '@/features/geolocation'
import { HeadingIndicator } from '@/shared/modules/maps'
import { Circle } from 'react-leaflet'

/**
 * Current user location map indicator
 */
export function UserLocation() {
  const { current } = useGeolocationContext()

  if (!current) return null

  const { metadata } = current
  const center = formatLatLng(current)

  return (
    <Circle
      center={center}
      data-role="user-coordinates"
      radius={2}
      stroke={false}
      fillColor="purple"
      fillOpacity={0.5}
    >
      <HeadingIndicator
        position={center}
        heading={metadata.heading}
        distance={3}
        width={4}
        length={5}
      />
      {metadata.accuracy && (
        <Circle
          center={center}
          radius={metadata.accuracy}
          color="blue"
          fillOpacity={0.125}
          stroke={false}
          interactive={false}
          data-role="user-accuracy"
        />
      )}
    </Circle>
  )
}
