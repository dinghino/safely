import type { CategoryOSMMapping } from './types.js'

/** build a reverse mapping from OSM tags to our category slugs. we need
 * this to look up the tags values and map them to our categories when we DTO
 * to {@link SourcePOI}
 */
export function mapToOSMCategories(mappings = defaultOSMCategoryMappings) {
  return mappings.reduce((acc, m) => {
    for (const query of m.osmQueries) {
      for (const tag of Object.values(query.tags)) {
        if (!acc.has(tag)) {
          acc.set(tag, [])
        }
        acc.get(tag)!.push(m.slug)
      }
    }
    return acc
  }, new Map<string, string[]>())
}

export type ReverseMapping = ReturnType<typeof mapToOSMCategories>

export function getCategoryFromTags(
  tags: Record<string, string> | undefined,
  mapping: CategoryOSMMapping[],
) {
  if (!tags) return undefined
  for (const tagQuery of Object.values(tags)) {
    const category = mapping.find((m) =>
      m.osmQueries.some((q) => Object.values(q.tags).includes(tagQuery)),
    )
    if (category) return category.slug
  }
  return undefined
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
    slug: 'dog-park',
    osmQueries: [{ tags: { leisure: 'dog_park' } }, { tags: { amenity: 'dog_park' } }],
  },
  {
    slug: 'off-leash-area',
    osmQueries: [
      { tags: { leisure: 'dog_park' } },
      // TODO: Find better OSM tags for off-leash areas
    ],
  },
  {
    slug: 'dog-waste-station',
    osmQueries: [
      { tags: { amenity: 'waste_disposal', waste: 'dog_excrement' } },
      // TODO: Verify OSM tags for dog waste stations
    ],
  },
  {
    slug: 'water-fountain',
    osmQueries: [{ tags: { amenity: 'drinking_water' } }, { tags: { amenity: 'water_point' } }],
  },
  {
    slug: 'vet-clinic',
    osmQueries: [{ tags: { amenity: 'veterinary' } }],
  },
  {
    slug: 'groomer',
    osmQueries: [{ tags: { shop: 'pet_grooming' } }],
  },
  {
    slug: 'pet-sitting-boarding',
    osmQueries: [
      // TODO: Find OSM tags for pet boarding/sitting
      { tags: { amenity: 'animal_boarding' } },
    ],
  },
  {
    slug: 'shelter-rescue',
    osmQueries: [{ tags: { amenity: 'animal_shelter' } }],
  },
  {
    slug: 'pet-supply-store',
    osmQueries: [{ tags: { shop: 'pet' } }],
  },
  {
    slug: 'dog-friendly-facilities',
    osmQueries: [
      // TODO: Find tags for dog-friendly cafes/restaurants
      { tags: { amenity: 'cafe', dog: 'yes' } },
      { tags: { amenity: 'restaurant', dog: 'yes' } },
    ],
  },
  {
    slug: 'dog-friendly-beach',
    osmQueries: [
      { tags: { natural: 'beach', dog: 'yes' } },
      // TODO: Verify tags for dog-friendly beaches
    ],
  },
  {
    slug: 'animal-control-office',
    osmQueries: [
      // TODO: Find proper OSM tags for animal control
      { tags: { office: 'government', government: 'animal_control' } },
    ],
  },
  // Note: Dangers and Alerts categories (bait/poison, hazards, lost pets, etc.)
  // are not typically in OSM - these would be user-reported POIs
]

export const reverseOSMCategoryMap = mapToOSMCategories(defaultOSMCategoryMappings)
