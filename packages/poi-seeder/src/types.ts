import { z } from 'zod'

/**
 * Intermediate POI representation (adapter output format)
 * This is the common format all adapters output before mapping to Convex schema
 */
export const sourcePOISchema = z.object({
  // Basic info
  name: z.string(),
  description: z.string().optional(),

  // Location
  latitude: z.number(),
  longitude: z.number(),

  // Category/type (OSM tags, etc.)
  category: z.string().optional(), // We'll map this to our category IDs
  tags: z.record(z.string(), z.string()).optional(), // Raw tags from source

  // Source metadata
  sourceId: z.string(), // ID in the source system (e.g., OSM node ID)
  sourceType: z.enum(['osm', 'geojson', 'manual']),

  // Optional attributes
  address: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
})

export type SourcePOI = z.infer<typeof sourcePOISchema>

/**
 * OSM-specific feature from Overpass API or OSM exports
 */
export interface OSMFeature {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number } // For ways/relations
  tags?: Record<string, string>
}
type CoordinateTuple = [lon: number, lat: number]
/**
 * GeoJSON Geometry types with proper coordinate types
 */
type PointGeometry = {
  type: 'Point'
  coordinates: CoordinateTuple
}

type LineStringGeometry = {
  type: 'LineString'
  coordinates: CoordinateTuple[]
}

type PolygonGeometry = {
  type: 'Polygon'
  coordinates: CoordinateTuple[][]
}

type MultiPointGeometry = {
  type: 'MultiPoint'
  coordinates: CoordinateTuple[]
}

type GeoJSONGeometry = PointGeometry | LineStringGeometry | PolygonGeometry | MultiPointGeometry

/**
 * GeoJSON Feature
 */
export interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: Record<string, any>
}

/**
 * Adapter interface - all adapters must implement this
 */
export interface POIAdapter {
  /**
   * Parse source data and return normalized POIs
   */
  parse(input: unknown): Promise<SourcePOI[]>

  /**
   * Validate that the input is compatible with this adapter
   */
  validate(input: unknown): boolean
}
