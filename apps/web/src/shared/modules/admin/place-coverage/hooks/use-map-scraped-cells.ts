'use client'

import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { useMapEvents } from 'react-leaflet'
import { api } from '@workspace/backend/api'
import type { FunctionReturnType } from 'convex/server'

const INITIAL_BOUNDS = {
  sw: { lat: 43.84399877553671, lng: 11.06778144836426 },
  ne: { lat: 43.881129336188245, lng: 11.231546401977539 },
}

export type ScrapedCellData = FunctionReturnType<typeof api.pois.get.scrapedCells>[number]

export function useMapScrapedCells() {
  const [bounds, setBounds] = useState(INITIAL_BOUNDS)

  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds()
      const sw = b.getSouthWest()
      const ne = b.getNorthEast()
      setBounds({ sw, ne })
    },
  })

  const cells = useQuery(api.pois.get.scrapedCells, { bounds })
  const [cachedCells, setCachedCells] = useState(cells)

  useEffect(() => {
    if (cells) {
      setCachedCells(cells)
    }
  }, [cells])

  return cachedCells
}
