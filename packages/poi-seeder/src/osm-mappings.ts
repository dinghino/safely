/**
 * OSM tag mapping configuration
 * Maps our POI category slugs to OSM tag combinations
 *
 * Each category can have multiple tag queries that will be OR'd together
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

/**
 * OSM tag mappings for our actual POI categories
 * Based on packages/backend/convex/seeds/poi_categories.ts
 *
 * TODO: Review and expand these mappings - they're initial guesses
 * Some categories may not have good OSM equivalents
 */
export const defaultOSMCategoryMappings: CategoryOSMMapping[] = [
  {
    categorySlug: 'dog-park',
    name: 'Dog Park',
    osmQueries: [{ tags: { leisure: 'dog_park' } }, { tags: { amenity: 'dog_park' } }],
  },
  {
    categorySlug: 'off-leash-area',
    name: 'Off-Leash Area',
    osmQueries: [
      { tags: { leisure: 'dog_park' } },
      // TODO: Find better OSM tags for off-leash areas
    ],
  },
  {
    categorySlug: 'dog-waste-station',
    name: 'Dog Waste Station',
    osmQueries: [
      { tags: { amenity: 'waste_disposal', waste: 'dog_excrement' } },
      // TODO: Verify OSM tags for dog waste stations
    ],
  },
  {
    categorySlug: 'water-fountain',
    name: 'Water Fountain',
    osmQueries: [{ tags: { amenity: 'drinking_water' } }, { tags: { amenity: 'water_point' } }],
  },
  {
    categorySlug: 'vet-clinic',
    name: 'Vet Clinic',
    osmQueries: [{ tags: { amenity: 'veterinary' } }],
  },
  {
    categorySlug: 'groomer',
    name: 'Groomer',
    osmQueries: [{ tags: { shop: 'pet_grooming' } }],
  },
  {
    categorySlug: 'pet-sitting-boarding',
    name: 'Pet Sitting / Boarding',
    osmQueries: [
      // TODO: Find OSM tags for pet boarding/sitting
      { tags: { amenity: 'animal_boarding' } },
    ],
  },
  {
    categorySlug: 'shelter-rescue',
    name: 'Shelter / Rescue',
    osmQueries: [{ tags: { amenity: 'animal_shelter' } }],
  },
  {
    categorySlug: 'pet-supply-store',
    name: 'Pet Supply Store',
    osmQueries: [{ tags: { shop: 'pet' } }],
  },
  {
    categorySlug: 'dog-friendly-facilities',
    name: 'Dog-Friendly Facilities',
    osmQueries: [
      // TODO: Find tags for dog-friendly cafes/restaurants
      { tags: { amenity: 'cafe', dog: 'yes' } },
      { tags: { amenity: 'restaurant', dog: 'yes' } },
    ],
  },
  {
    categorySlug: 'dog-friendly-beach',
    name: 'Dog-Friendly Beach',
    osmQueries: [
      { tags: { natural: 'beach', dog: 'yes' } },
      // TODO: Verify tags for dog-friendly beaches
    ],
  },
  {
    categorySlug: 'animal-control-office',
    name: 'Animal Control Office',
    osmQueries: [
      // TODO: Find proper OSM tags for animal control
      { tags: { office: 'government', government: 'animal_control' } },
    ],
  },
  // Note: Dangers and Alerts categories (bait/poison, hazards, lost pets, etc.)
  // are not typically in OSM - these would be user-reported POIs
]

/**
 * Build Overpass QL query for a category mapping
 */
export function buildOverpassQuery(
  mapping: CategoryOSMMapping,
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number },
): string {
  const { minLat, minLon, maxLat, maxLon } = bbox

  // Build individual node queries for each tag combination
  const queries = mapping.osmQueries.map((query) => {
    const tagFilters = Object.entries(query.tags)
      .map(([key, value]) => `["${key}"="${value}"]`)
      .join('')

    return `  node${tagFilters}(${minLat},${minLon},${maxLat},${maxLon});`
  })

  // Combine all queries with union
  return `[out:json][timeout:60];
(
${queries.join('\n')}
);
out body;
>;
out skel qt;`
}
