import { latLngBounds } from 'leaflet'

import type { MapQueryBounds } from '@workspace/backend/types'
import { PlacesMapLayer } from '@/features/place-map/components'
import { SimpleMap } from '@/widgets/maps/simple-map'
import { ScrapedCellsLayer } from '@/shared/modules/admin/place-coverage/components/scraped-cells-layer'

const INITIAL_BOUNDS = {
  sw: { lat: 43.84399877553671, lng: 11.06778144836426 },
  ne: { lat: 43.881129336188245, lng: 11.231546401977539 },
} satisfies MapQueryBounds

function toLatLngTuple(bounds: MapQueryBounds) {
  return latLngBounds(bounds.sw, bounds.ne)
}

export namespace PlacesMap {
  export type Props = {
    className?: string
    children?: React.ReactNode
    defaultLayerGroups?: string[]
  }
}

export const PlacesMap = (props: PlacesMap.Props) => {
  const { className, children, defaultLayerGroups = [] } = props
  return (
    <SimpleMap
      className={className}
      bounds={toLatLngTuple(INITIAL_BOUNDS)}
      defaultLayerGroups={['Places', ...defaultLayerGroups]}
    >
      <PlacesMapLayer name="Places" />
      <ScrapedCellsLayer name="Cells" />
      {children}
    </SimpleMap>
  )
}
