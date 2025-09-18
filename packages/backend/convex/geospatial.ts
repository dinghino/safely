import { GeospatialIndex } from '@convex-dev/geospatial'
import { components } from './_generated/api'
import type { Id } from './_generated/dataModel'

/** Generic geospatial index - follows documentation */
const geospatial = new GeospatialIndex(components.geospatial)

/** User Devices locations geospatial index */
const deviceLocations = new GeospatialIndex<Id<'devices'>, { deviceId: string }>(
  components.geospatial,
)

export { geospatial, deviceLocations }

export default geospatial
