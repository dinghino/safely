'use client'

import { MapLayerGroup } from '@/shared/modules/maps'
import { useMapScrapedCells } from '../hooks/use-map-scraped-cells'
import { ScrapedCell } from './scraped-cell'

export namespace ScrapedCellsLayer {
  export type Props = {
    name?: string
  }
}

export const ScrapedCellsLayer = ({ name = 'Cells' }: ScrapedCellsLayer.Props) => {
  const cells = useMapScrapedCells()

  return (
    <MapLayerGroup name={name}>
      {cells?.map((cell) => (
        <ScrapedCell key={cell._id} cell={cell} />
      ))}
    </MapLayerGroup>
  )
}
