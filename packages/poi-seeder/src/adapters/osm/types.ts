/**
 * OSM-specific types and interfaces
 */

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

/**
 * OSM tag query configuration
 */
export interface OSMTagQuery {
  /**
   * OSM tag key-value pairs
   * Multiple pairs in one query are AND'd together
   */
  tags: Record<string, string>
  /**
   * Optional description of what this tag combination represents
   */
  description?: string
}

/**
 * Maps our POI category slugs to OSM tag combinations
 */
export interface CategoryOSMMapping {
  /**
   * Our category slug
   */
  categorySlug: string
  /**
   * Display name
   */
  name: string
  /**
   * OSM tag queries - will be OR'd together in the Overpass query
   */
  osmQueries: OSMTagQuery[]
}
