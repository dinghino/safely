import type { Id } from '../../_generated/dataModel'
import { GeospatialIndex } from '@convex-dev/geospatial'
import { components } from '../../_generated/api'

export type PoiGeospatialFilter = {
  category: Id<'poiCategory'>
  categoryGroup: Id<'poiCategoryGroup'>
}

export const geospatial = new GeospatialIndex<Id<'pois'>, PoiGeospatialFilter>(components.poisGis)
