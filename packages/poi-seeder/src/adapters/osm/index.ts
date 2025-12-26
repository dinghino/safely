import type { FetchOptions, POIFetcher, SourcePOI } from '../../types.js'
import { sourcePOISchema } from '../../types.js'
import { defaultOSMCategoryMappings, getCategoryFromTags } from './osm.config.js'
import { buildOverpassQuery } from './query-builder.js'
import type { CategoryOSMMapping, OSMFeature } from './types.js'

const OVERPASS_API_URL = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'

/**
 * Fetcher for OpenStreetMap data via Overpass API
 * Implements both POIFetcher (high-level) and POIAdapter (low-level parsing)
 */
export class OSMFetcher implements POIFetcher {
  private readonly apiUrl: string
  private readonly categoryMappings: CategoryOSMMapping[]

  constructor(config?: { apiUrl?: string; categoryMappings?: CategoryOSMMapping[] }) {
    this.apiUrl = config?.apiUrl ?? OVERPASS_API_URL
    this.categoryMappings = config?.categoryMappings ?? defaultOSMCategoryMappings
  }

  /**
   * High-level fetch: Get POIs for given categories and bbox
   */
  async fetch(options: FetchOptions): Promise<SourcePOI[]> {
    const allPOIs: SourcePOI[] = []

    for (const categorySlug of options.categories) {
      const mapping = this.categoryMappings.find((m) => m.slug === categorySlug)

      if (!mapping) {
        console.warn(`⚠️  Unknown category: ${categorySlug} (skipping)`)
        continue
      }

      const query = buildOverpassQuery(mapping, options.boundingBox)
      const pois = await this.fetchWithQuery(query)

      allPOIs.push(...pois)
    }

    return allPOIs
  }

  /**
   * List available category slugs
   */
  listCategories(): string[] {
    return this.categoryMappings.map((m) => m.slug)
  }

  /**
   * Get category mapping details
   */
  getCategoryMappings(): CategoryOSMMapping[] {
    return this.categoryMappings
  }

  /**
   * Low-level fetch with raw Overpass QL query
   */
  private async fetchWithQuery(overpassQuery: string): Promise<SourcePOI[]> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: overpassQuery,
      headers: {
        'Content-Type': 'text/plain',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}\n${text}`)
    }

    const data = await response.json()
    return this.parse(data)
  }

  /**
   * POIAdapter implementation: validate input format
   */
  validate(input: unknown): boolean {
    if (!input || typeof input !== 'object') return false
    const data = input as any

    // Check for Overpass API response format
    if (data.elements && Array.isArray(data.elements)) return true

    // Check for OSM XML converted to JSON
    if (data.osm && Array.isArray(data.osm.node)) return true

    return false
  }

  /**
   * POIAdapter implementation: parse raw OSM data
   */
  async parse(input: unknown): Promise<SourcePOI[]> {
    const data = input as any
    const features: OSMFeature[] = []

    // Handle Overpass API JSON format
    if (data.elements) {
      features.push(...data.elements)
    }

    // Handle OSM XML -> JSON format (if needed)
    if (data.osm?.node) {
      features.push(
        ...data.osm.node.map((n: any) => ({
          type: 'node' as const,
          id: n.$.id,
          lat: Number.parseFloat(n.$.lat),
          lon: Number.parseFloat(n.$.lon),
          tags: this.parseTags(n.tag),
        })),
      )
    }

    return features
      .map((f) => this.convertOSMFeature(f))
      .filter((poi): poi is SourcePOI => {
        if (!poi) return false
        const result = sourcePOISchema.safeParse(poi)
        return result.success
      })
  }

  private parseTags(tagArray: any[]): Record<string, string> {
    if (!Array.isArray(tagArray)) return {}
    return tagArray.reduce(
      (acc, tag) => {
        if (tag.$?.k && tag.$.v) {
          acc[tag.$.k] = tag.$.v
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }

  private convertOSMFeature(feature: OSMFeature): SourcePOI | null {
    const tags = feature.tags || {}

    // Determine coordinates
    let lat: number | undefined
    let lon: number | undefined

    if (feature.type === 'node' && feature.lat && feature.lon) {
      lat = feature.lat
      lon = feature.lon
    } else if (feature.center) {
      lat = feature.center.lat
      lon = feature.center.lon
    }

    if (!lat || !lon) return null // Skip features without coordinates

    // Extract name
    const name = tags.name || tags['name:en'] || `OSM ${feature.type} ${feature.id}`

    // Build description from tags
    const description = this.buildDescription(tags)
    const category = getCategoryFromTags(feature.tags, this.categoryMappings)
    return {
      name,
      description,
      latitude: lat,
      longitude: lon,
      category,
      tags,
      sourceId: `osm:${feature.type}:${feature.id}`,
      sourceType: 'osm',
      address: tags['addr:full'] || this.buildAddress(tags),
      website: tags.website || tags.url,
      phone: tags.phone || tags['contact:phone'],
    }
  }

  private buildDescription(tags: Record<string, string>): string | undefined {
    const parts: string[] = []

    if (tags.description) parts.push(tags.description)
    if (tags.amenity) parts.push(`Type: ${tags.amenity}`)
    if (tags.cuisine) parts.push(`Cuisine: ${tags.cuisine}`)
    if (tags.opening_hours) parts.push(`Hours: ${tags.opening_hours}`)

    return parts.length > 0 ? parts.join(' | ') : undefined
  }

  private buildAddress(tags: Record<string, string>): string | undefined {
    const parts: string[] = []

    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
    if (tags['addr:street']) parts.push(tags['addr:street'])
    if (tags['addr:city']) parts.push(tags['addr:city'])
    if (tags['addr:postcode']) parts.push(tags['addr:postcode'])
    if (tags['addr:country']) parts.push(tags['addr:country'])

    return parts.length > 0 ? parts.join(', ') : undefined
  }
}
