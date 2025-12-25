import type { GeoJSONFeature, POIAdapter, SourcePOI } from '../../types.js'
import { sourcePOISchema } from '../../types.js'

/**
 * Adapter for GeoJSON files
 * For reading and parsing GeoJSON data
 */
export class GeoJSONAdapter implements POIAdapter {
  /**
   * Extract lat/lon from GeoJSON geometry
   * Currently only handles Point geometries - will expand for boundaries/geofences later
   */
  private extractCoordinates(
    geometry: GeoJSONFeature['geometry'],
  ): { lat: number; lon: number } | null {
    // Get first coordinate pair regardless of geometry type
    let coords: [number, number] | undefined

    switch (geometry.type) {
      case 'Point':
        coords = geometry.coordinates
        break
      case 'LineString':
      case 'MultiPoint':
        coords = geometry.coordinates[0]
        break
      case 'Polygon':
        coords = geometry.coordinates[0]?.[0]
        break
    }

    if (!coords) return null

    const [lon, lat] = coords
    return { lon, lat }
  }

  validate(input: unknown): boolean {
    if (!input || typeof input !== 'object') return false
    const data = input as any

    // Check for FeatureCollection
    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      return true
    }

    // Check for single Feature
    if (data.type === 'Feature' && data.geometry && data.properties) {
      return true
    }

    return false
  }

  async parse(input: unknown): Promise<SourcePOI[]> {
    const data = input as any
    let features: GeoJSONFeature[] = []

    if (data.type === 'FeatureCollection') {
      features = data.features
    } else if (data.type === 'Feature') {
      features = [data]
    }

    return features
      .map((f) => this.convertGeoJSONFeature(f))
      .filter((poi): poi is SourcePOI => {
        if (!poi) return false
        const result = sourcePOISchema.safeParse(poi)
        return result.success
      })
  }

  private convertGeoJSONFeature(feature: GeoJSONFeature): SourcePOI | null {
    const { geometry, properties } = feature

    // Extract coordinates based on geometry type
    const coords = this.extractCoordinates(geometry)
    if (!coords) return null

    const { lat, lon } = coords

    // Extract properties
    const name = properties.name || properties.title || 'Unnamed POI'
    const description = properties.description || properties.desc
    const category = properties.category || properties.type

    // Generate source ID
    const sourceId = properties.id || properties.osm_id || `geojson:${Date.now()}:${Math.random()}`

    return {
      name,
      description,
      latitude: lat,
      longitude: lon,
      category,
      tags: properties,
      sourceId: `geojson:${sourceId}`,
      sourceType: 'geojson',
      address: properties.address || properties.addr,
      website: properties.website || properties.url,
      phone: properties.phone || properties.telephone,
    }
  }
}
