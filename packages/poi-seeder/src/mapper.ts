import type { Id } from '@workspace/backend/dataModel'
import type { SourcePOI } from './types.js'

/**
 * Simplified DTO for POI import
 * Client will resolve category IDs and finalize structure before sending to Convex
 */
export interface POIImportDto {
  name: string
  description?: string
  categorySlug: string // Will be resolved to ID by client
  coordinates: {
    lat: number
    lng: number
  }
  metadata?: {
    address?: string
    phone?: string
    website?: string
  }
  attribution?: {
    source: string
    url?: string
  }
}

/**
 * Final DTO sent to Convex mutation
 * After category ID resolution
 */
export interface ConvexPOIDto {
  name: string
  description?: string
  categoryId: Id<'poiCategory'>
  addedBy: Id<'users'>
  coordinates: {
    lat: number
    lng: number
  }
  metadata?: {
    address?: string
    phone?: string
    website?: string
  }
  attribution?: {
    source: string
    url?: string
  }
}

/**
 * Map a SourcePOI to POIImportDto
 * This creates the intermediate format before category ID resolution
 */
export function mapToPOIImport(source: SourcePOI, categorySlug: string): POIImportDto {
  const attribution = buildAttribution(source)

  const metadata: POIImportDto['metadata'] = {}
  if (source.address) metadata.address = source.address
  if (source.phone) metadata.phone = source.phone
  if (source.website) metadata.website = source.website

  return {
    name: source.name,
    description: source.description,
    categorySlug,
    coordinates: {
      lat: source.latitude,
      lng: source.longitude,
    },
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    attribution,
  }
}

/**
 * Build attribution object from source POI
 */
function buildAttribution(source: SourcePOI): { source: string; url?: string } | undefined {
  switch (source.sourceType) {
    case 'osm':
      return {
        source: 'OpenStreetMap',
        url: `https://www.openstreetmap.org/${source.sourceId.replace('osm:', '').replace(':', '/')}`,
      }
    case 'geojson':
      return {
        source: 'GeoJSON Import',
      }
    case 'manual':
      return undefined // No attribution for manual entries
    default:
      return undefined
  }
}

/**
 * Batch mapper for multiple POIs
 */
export function mapBatchToPOIImports(sources: SourcePOI[], categorySlug: string): POIImportDto[] {
  return sources.map((source) => mapToPOIImport(source, categorySlug))
}
