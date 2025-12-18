import type { Id } from '@workspace/backend/dataModel'
import type { SourcePOI } from './types.js'
import { z } from 'zod/v4'

const importDto = z.object({
  name: z.string(),
  description: z.string().optional(),
  categorySlug: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  metadata: z
    .object({
      address: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  attribution: z
    .object({
      source: z.string(),
      url: z.string().optional(),
    })
    .optional(),
})

/**
 * Simplified DTO for POI import
 * Client will resolve category IDs and finalize structure before sending to Convex
 */
export type ImportDto = z.infer<typeof importDto>

/**
 * Final DTO sent to Convex mutation
 * After category ID resolution
 * @note will be deprecated if we move to direct Convex actions
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

export class DtoMapper {
  toImportDto(source: SourcePOI, categorySlug: string): ImportDto {
    const attribution = buildAttribution(source)
    const metadata: ImportDto['metadata'] = {}
    if (source.address) metadata.address = source.address
    if (source.phone) metadata.phone = source.phone
    if (source.website) metadata.website = source.website

    return importDto.parse({
      name: source.name,
      description: source.description,
      categorySlug,
      coordinates: { lat: source.latitude, lng: source.longitude },
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      attribution,
    })
  }

  batchImportDto(sources: SourcePOI[], categories: string[]): ImportDto[] {
    const poisByCategory = new Map<string, SourcePOI[]>()

    if (!sources?.length || !categories?.length) return []

    for (const categorySlug of categories) {
      poisByCategory.set(
        categorySlug,
        sources.filter((p) => p.category === categorySlug),
      )
    }

    const results: ImportDto[] = []
    for (const [slug, poi] of poisByCategory.entries()) {
      results.push(...poi.map((p) => this.toImportDto(p, slug)))
    }

    return results
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
