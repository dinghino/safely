'use client'

import { Rectangle, Tooltip } from 'react-leaflet'
import type { ScrapedCellData } from '../hooks/use-map-scraped-cells'

export const ScrapedCell = ({ cell }: { cell: ScrapedCellData }) => {
  const color = cell.status === 'done' ? '#22c55e' : '#eab308'
  const bbox = cell.bbox
  const bounds: [[number, number], [number, number]] = [
    [bbox.minLat, bbox.minLon],
    [bbox.maxLat, bbox.maxLon],
  ]

  const totalPois = Object.values(cell.counts || {}).reduce((a, b) => a + b, 0)

  return (
    <Rectangle
      key={cell._id}
      bounds={bounds}
      pathOptions={{
        color: color,
        weight: 0.5,
        fillOpacity: 0.05,
      }}
    >
      <Tooltip direction="center" opacity={0.15} sticky>
        <div className="font-bold text-[10px]">
          {cell.geohash}
          <br />
          {totalPois} places
        </div>
      </Tooltip>
    </Rectangle>
  )
}
