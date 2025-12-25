import { z } from 'zod'
import type { BoundingBox } from './config.js'

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
 * GeoJSON types
 */
type CoordinateTuple = [lon: number, lat: number]

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

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: Record<string, any>
}

/**
 * Options for fetching POIs from a source
 */
export interface FetchOptions {
  boundingBox: BoundingBox
  categories: string[] // category slugs
}

/**
 * Adapter interface - all adapters must implement this
 * Used for parsing raw data from files or API responses
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

/**
 * Fetcher interface - high-level interface for fetching POIs from various sources
 * Extends POIAdapter for backward compatibility
 */
export interface POIFetcher extends POIAdapter {
  /**
   * Fetch POIs from source with given options
   * Returns normalized SourcePOI[] ready for mapping
   */
  fetch(options: FetchOptions): Promise<SourcePOI[]>

  /**
   * List available categories for this fetcher
   */
  listCategories(): string[]
}

export interface Writer {
  write(data: any[]): Promise<void>
}
