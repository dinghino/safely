# @workspace/poi-seeder

A utility package for fetching and mapping Points of Interest (POI) data from external sources (currently OpenStreetMap) to structured DTOs for import into the Safely backend.

## Overview

This package provides:
- **Fetchers**: Adapters for fetching POI data from external sources (OSM)
- **Mappers**: Transform raw POI data into standardized DTOs
- **CLI**: Debug and inspection tool for testing fetchers

**Note**: This package is designed as a **library dependency** for `@workspace/backend`. The actual data seeding is handled by Convex internal actions in the backend.

## Installation

This is an internal workspace package. Install it as a dependency in other workspace packages:

```json
{
  "dependencies": {
    "@workspace/poi-seeder": "workspace:*"
  }
}
```

## Usage

### As a Library (Backend Integration)

The backend uses this package to fetch and seed POI data via Convex actions:

```typescript
import { createFetcher } from '@workspace/poi-seeder'
import { DtoMapper } from '@workspace/poi-seeder/mapper'

// 1. Create a fetcher
const fetcher = createFetcher({ type: 'osm' })

// 2. Fetch POIs
const rawPois = await fetcher.fetch({
  boundingBox: [minLat, minLng, maxLat, maxLng],
  categories: ['dog-park', 'vet-clinic']
})

// 3. Map to DTOs
const mapper = new DtoMapper()
const dtos = mapper.batchImportDto(rawPois, ['dog-park'])
```

### CLI (Development/Debugging)

The CLI is provided for **debugging and inspection** purposes only:

```bash
# Fetch POIs for specific categories and bbox
bun run fetch --categories dog-park,vet-clinic --bbox 51.5074,-0.1278,51.5174,-0.1178

# View help
bun run fetch --help
```

**Options:**
- `--categories <slugs>`: Comma-separated list of category slugs (e.g., `dog-park,vet-clinic`)
- `--bbox <coords>`: Bounding box as `minLat,minLng,maxLat,maxLng`
- `--output <file>`: Optional output file path (default: stdout)

## Architecture

### Decoupled Design

This package is **independent** of the Convex backend:
- ✅ No backend imports or dependencies
- ✅ Uses generic types (`string` for IDs, not `Id<'table'>`)
- ✅ Can be used standalone or integrated into any backend

### Data Flow

```
External Source (OSM) 
  → Fetcher (fetch raw data)
  → Mapper (transform to DTO)
  → Backend (Convex action saves to DB)
```

### Supported Sources

Currently supports:
- **OpenStreetMap (OSM)**: Via Overpass API

Future support planned for:
- Google Places
- Custom data sources

## Export Structure

```typescript
// Main entry point
import { createFetcher, OSMFetcher, GeoJSONAdapter } from '@workspace/poi-seeder'

// Mapper utilities
import { DtoMapper, type ConvexPOIDto, type ImportDto } from '@workspace/poi-seeder/mapper'
```

## Development

```bash
# Run CLI locally
bun run app fetch --categories dog-park --bbox 40.7,-74.0,40.8,-73.9

# Type checking
bun run type-check
```

## Integration Notes

The backend (`@workspace/backend`) uses this package in:
- `convex/pois/scraping.ts`: Internal action for automated scraping
- Geohashing and region tracking are handled backend-side
- POI deduplication and validation happen in Convex mutations

For more details on backend integration, see `packages/backend/convex/pois/scraping.ts`.
