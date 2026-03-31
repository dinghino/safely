import type { POIFetcher } from '../types.js'
import { OSMFetcher } from './osm/index.js'

/**
 * Factory function to create a POI fetcher based on source type
 */
export function createFetcher(options?: { type?: string }): POIFetcher {
  const type = options?.type ?? 'osm'

  switch (type) {
    case 'osm':
      return new OSMFetcher()
    // Future sources:
    // case 'geojson':
    //   return new GeoJSONFetcher()
    default:
      throw new Error(`Unknown fetcher type: ${type}`)
  }
}

// Re-export for direct usage
export { OSMFetcher } from './osm/index.js'
export { GeoJSONAdapter } from './geojson/index.js'
