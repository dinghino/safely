import type { Id } from "@workspace/backend/dataModel";
import type { SourcePOI } from "./types.js";

/**
 * DTO for creating a POI in Convex
 * Maps to the pointOfInterest table schema
 */
export interface ConvexPOIDto {
  name: string;
  description?: string;
  categoryId: Id<"poiCategory">;
  addedBy: Id<"users">;
  geohash: string;
  attribution?: {
    source: string;
    url?: string;
  };
}

/**
 * Category mapping configuration
 * Maps source categories to Convex category IDs
 */
export type CategoryMapping = Map<string, Id<"poiCategory">>;

/**
 * Mapper options
 */
export interface MapperOptions {
  authorId: Id<"users">;
  categoryMapping: CategoryMapping;
  defaultCategoryId: Id<"poiCategory">;
}

/**
 * Map a SourcePOI to ConvexPOIDto
 */
export function mapToConvexPOI(
  source: SourcePOI,
  options: MapperOptions
): ConvexPOIDto {
  // Determine category ID
  const categoryId = source.category
    ? options.categoryMapping.get(source.category) || options.defaultCategoryId
    : options.defaultCategoryId;

  // Generate geohash from coordinates
  const geohash = generateGeohash(source.latitude, source.longitude);

  // Build attribution based on source type
  const attribution = buildAttribution(source);

  return {
    name: source.name,
    description: source.description,
    categoryId,
    addedBy: options.authorId,
    geohash,
    attribution,
  };
}

/**
 * Generate a geohash from latitude and longitude
 * TODO: Replace with H3 indexing library (h3-js)
 * For now, using a simple placeholder implementation
 */
function generateGeohash(lat: number, lon: number, precision = 9): string {
  // TODO: Use H3 indexing instead
  // import { latLngToCell } from 'h3-js'
  // return latLngToCell(lat, lon, resolution)
  
  // Temporary simple geohash for development
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let isEven = true;
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let geohash = "";
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (lonMin + lonMax) / 2;
      if (lon > mid) {
        ch |= 1 << (4 - bit);
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat > mid) {
        ch |= 1 << (4 - bit);
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    isEven = !isEven;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Build attribution object from source POI
 */
function buildAttribution(source: SourcePOI): { source: string; url?: string } | undefined {
  switch (source.sourceType) {
    case "osm":
      return {
        source: "OpenStreetMap",
        url: `https://www.openstreetmap.org/${source.sourceId.replace("osm:", "").replace(":", "/")}`,
      };
    case "geojson":
      return {
        source: "GeoJSON Import",
      };
    case "manual":
      return undefined; // No attribution for manual entries
    default:
      return undefined;
  }
}

/**
 * Batch mapper for multiple POIs
 */
export function mapBatchToConvexPOIs(
  sources: SourcePOI[],
  options: MapperOptions
): ConvexPOIDto[] {
  return sources.map(source => mapToConvexPOI(source, options));
}
