'use client'

import { MapLayerGroup } from '@/shared/modules/maps'
import { useMapScrapedCells } from '../hooks/use-map-scraped-cells'
import { ScrapedCell } from './scraped-cell'

export const ScrapedCellsLayer = () => {
  const cells = useMapScrapedCells()

  return (
    <MapLayerGroup name="cells">
      {cells?.map((cell) => (
        <ScrapedCell key={cell._id} cell={cell} />
      ))}
    </MapLayerGroup>
  )
}
