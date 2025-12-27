import geospatial from '@convex-dev/geospatial/convex.config'
import presence from '@convex-dev/presence/convex.config'
import { defineApp } from 'convex/server'

const app = defineApp()
app.use(geospatial) // Shared (Devices/Tracking)
app.use(geospatial, { name: 'poisGis' }) // Dedicated POI Index
app.use(presence)

export default app
