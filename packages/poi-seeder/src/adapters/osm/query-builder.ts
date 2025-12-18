import type { BoundingBox } from '../../config.js'
import type { CategoryOSMMapping } from './types.js'

/**
 * Build Overpass QL query for a category mapping
 */
export function buildOverpassQuery(mapping: CategoryOSMMapping, bbox: BoundingBox): string {
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
