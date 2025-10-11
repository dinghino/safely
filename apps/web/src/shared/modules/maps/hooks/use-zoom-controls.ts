'use client'

import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

import type { Map as LeafletMapInstance } from 'leaflet'

export type ZoomState = {
  canZoomIn: boolean
  canZoomOut: boolean
  current: number
  min: number
  max: number
}

function computeZoomState(map?: LeafletMapInstance): ZoomState {
  if (!map) {
    return { canZoomIn: true, canZoomOut: true, current: 13, min: 5, max: 18 }
  }
  const [min, max, current] = [map.getMinZoom(), map.getMaxZoom(), map.getZoom()]
  const [canZoomIn, canZoomOut] = [current < max, current > min]
  return { canZoomIn, canZoomOut, current, min, max }
}

/**
 * Hook to manage zoom state and actions for the map synced with react components.
 * @todo move to map library / components / package / whatever we have set up
 */
export function useZoomControls() {
  const map = useMap()

  const [state, setCanZoom] = useState<ZoomState>(computeZoomState(map))

  useEffect(() => {
    const handleZoomChange = () => setCanZoom(computeZoomState(map))
    map.on('zoom', handleZoomChange)
    return () => {
      map.off('zoom', handleZoomChange)
    }
  }, [map])

  const increase = () => map.zoomIn()
  const decrease = () => map.zoomOut()

  return { ...state, increase, decrease }
}
