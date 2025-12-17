# POI Seeder

A TypeScript-based tool for importing Points of Interest (POIs) from various sources (OpenStreetMap, GeoJSON, etc.) into your Convex database.

## Features

- 🗺️ **Multi-source support**: Import from OSM (Overpass API), GeoJSON files
- 🔄 **Pluggable adapters**: Easy to add new data sources
- 🎯 **Type-safe**: Full TypeScript support with types from `@workspace/backend`
- 🔐 **Secure**: Uses Convex deploy keys for authenticated writes
- 🧪 **Dry-run mode**: Preview imports before writing to database

## Setup

### 1. Install dependencies

From the project root:

```bash
bun install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

```bash
cd packages/poi-seeder
cp .env.example .env
```

Edit `.env` with your values:

```env
# Get this from your Convex dashboard
CONVEX_URL=https://your-deployment.convex.cloud

# Generate a deploy key in Convex dashboard > Settings > Deploy Keys
CONVEX_DEPLOY_KEY=your-deploy-key-here

# Your Clerk user ID (temporary, for testing)
# You can find this in your app's user management or database
POI_AUTHOR_ID=user_xxxxxxxxxxxxx
```

### 3. Get a Convex Deploy Key

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to **Settings** > **Deploy Keys**
4. Click **Generate a deploy key**
5. Copy the key and add it to your `.env` file

## Usage

### Dry Run (Preview Only)

Test the import without writing to the database:

```bash
bun run seed --source osm --file ./samples/sample-osm.json --dry-run
```

```bash
bun run seed --source geojson --file ./samples/sample-geojson.json --dry-run
```

### Import POIs

Import POIs from an OSM export:

```bash
bun run seed --source osm --file ./samples/sample-osm.json --category <category-id>
```

Import POIs from a GeoJSON file:

```bash
bun run seed --source geojson --file ./samples/sample-geojson.json --category <category-id>
```

### Options

- `-s, --source <type>`: Source type (`osm` or `geojson`)
- `-f, --file <path>`: Path to the source file
- `-c, --category <id>`: Default category ID for POIs (required)
- `--dry-run`: Preview without writing to database

## Data Sources

### OpenStreetMap (Overpass API)

Query the Overpass API to get POI data:

```bash
# Example Overpass query for dog parks in an area
curl -X POST https://overpass-api.de/api/interpreter \
  -d '[out:json];node["amenity"="dog_park"](40.7,-74.1,40.8,-73.9);out;' \
  > dog-parks.json
```

Then import:

```bash
bun run seed --source osm --file dog-parks.json --category <dog-park-category-id>
```

### GeoJSON

Export POIs from QGIS, geojson.io, or other GIS tools as GeoJSON, then import:

```bash
bun run seed --source geojson --file my-pois.geojson --category <category-id>
```

## Architecture

```
packages/poi-seeder/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── config.ts           # Configuration and env validation
│   ├── types.ts            # Type definitions
│   ├── mapper.ts           # DTO mapping to Convex schema
│   ├── convex-client.ts    # Convex client wrapper
│   └── adapters/
│       ├── osm.ts          # OpenStreetMap adapter
│       └── geojson.ts      # GeoJSON adapter
├── samples/                # Sample data files
└── README.md
```

## Adding New Adapters

1. Create a new adapter file in `src/adapters/`
2. Implement the `POIAdapter` interface:

```typescript
export class MyAdapter implements POIAdapter {
  validate(input: unknown): boolean {
    // Validate input format
  }

  async parse(input: unknown): Promise<SourcePOI[]> {
    // Parse and return normalized POIs
  }
}
```

3. Add to CLI in `src/cli.ts`

## Category Mapping

The seeder currently uses a default category ID. In the future, you can:

1. Fetch categories from Convex before seeding
2. Build a mapping from source categories to Convex category IDs
3. Use the mapping in the DTO conversion

Example:

```typescript
const categoryMapping = new Map([
  ["dog_park", "k1234567" as Id<"poiCategory">],
  ["veterinary", "k7654321" as Id<"poiCategory">],
]);
```

## TODO / Future Improvements

- [ ] Fetch category mappings from Convex dynamically
- [ ] Implement batch mutation in Convex for better performance
- [ ] Add CSV adapter
- [ ] Add progress bar for large imports
- [ ] Add validation and duplicate detection
- [ ] Support for updating existing POIs
- [ ] Automated OSM Overpass queries from CLI

## Development

### Type checking

```bash
bun run type-check
```

### Build

```bash
bun run build
```

## Notes

- **Author ID**: Currently requires a user ID. This is temporary - see main project discussion about system/service accounts.
- **Geohash**: Uses a simple built-in geohash implementation. Consider using `ngeohash` for production.
- **Categories**: You'll need to create POI categories in your Convex database first, then use their IDs in the seeder.

## License

Same as parent project.
