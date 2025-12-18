#!/usr/bin/env bun
import { Command } from 'commander'
import { config as dotenvConfig } from 'dotenv'
import { createFetcher } from './adapters/index.js'
import { loadConfig } from './config.js'
import { DtoMapper } from './mapper.js'
import { ConvexPOIClient } from './convex-client.js'
import type { SourcePOI } from './types.js'

// Load .env file
dotenvConfig()

/**
 * Validate and normalize category options
 */
function validateCategories(options: any): string[] {
  if (!options.categories || options.categories.length === 0) {
    console.error('❌ Error: --categories is required (or use --list-categories)')
    console.log('\nExample:')
    console.log('  bun run fetch --categories dog-park vet-clinic')
    process.exit(1)
  }
  return options.categories
}

/**
 * Log POI results with sample data and optional DTO preview
 */
function logPOIResults(
  pois: SourcePOI[],
  options: { dto?: boolean; categories: string[]; count?: number },
  isDryRun = false,
) {
  const count = options.count ?? 3
  console.log(`\n📊 Total POIs fetched: ${pois.length}\n`)

  if (pois.length === 0) {
    console.log('No POIs found.')
    return
  }

  // Show sample source POIs
  console.log('Sample Source POIs:')
  console.log(JSON.stringify(pois.slice(0, count), null, 2))

  if (pois.length > count) {
    console.log(`\n...and ${pois.length - count} more`)
  }

  // Show import DTO preview
  if (options.dto) {
    console.log('\n\n📦 Import DTO Preview:\n')
    const mapper = new DtoMapper()
    const allImports = mapper.batchImportDto(pois, options.categories)

    // const allImports = mapPOIsToImportDTOs(pois, options.categories)

    console.log(JSON.stringify(allImports.slice(0, count), null, 2))
    if (allImports.length > count) {
      console.log(`\n...and ${allImports.length - count} more would be imported`)
    }

    if (isDryRun) {
      console.log('\n✓ Dry run complete. No data was written to Convex.')
    }
  }
}

const program = new Command()

program
  .name('poi-seeder')
  .description('POI seeder for importing data from OSM and other sources')
  .version('0.1.0')

program
  .command('fetch')
  .description('Fetch POIs from OSM and log to console (no Convex write)')
  .option('-c, --categories <slugs...>', 'Category slugs to fetch (e.g., dog-park vet-clinic)')
  .option('--list-categories', 'List available category mappings')
  .option('--dto', 'Show import DTO mapping preview')
  .action(async (options) => {
    try {
      const fetcher = createFetcher({ type: 'osm' })

      if (options.listCategories) {
        console.log('\n📋 Available OSM category mappings:\n')
        const categories = fetcher.listCategories()
        for (const slug of categories) {
          console.log(`  - ${slug}`)
        }
        console.log('')
        return
      }

      const categories = validateCategories(options)

      console.log('🚀 Fetching POIs from OpenStreetMap...\n')

      const config = loadConfig(false)
      const { boundingBox } = config
      console.log('✓ Configuration loaded')
      console.log(
        `  Bounding box: [${boundingBox.minLat}, ${boundingBox.minLon}] to [${boundingBox.maxLat}, ${boundingBox.maxLon}]\n`,
      )

      const pois = await fetcher.fetch({ boundingBox, categories })

      logPOIResults(pois, { ...options, categories })

      // TODO: May add option to write results to file for debugging
    } catch (error) {
      console.error('\n❌ Error during fetch:', error)
      process.exit(1)
    }
  })

program
  .command('seed')
  .description('Seed POIs from OSM to Convex database')
  .requiredOption(
    '-c, --categories <slugs...>',
    'Category slugs to seed (e.g., dog-park vet-clinic)',
  )
  .option('--list-categories', 'List available category mappings')
  .option('--dry-run', 'Fetch and map POIs without writing to Convex')
  .action(async (options) => {
    try {
      const fetcher = createFetcher({ type: 'osm' })
      const mapper = new DtoMapper()

      if (options.listCategories) {
        console.log('\n📋 Available OSM category mappings:\n')
        const categories = fetcher.listCategories()
        for (const slug of categories) {
          console.log(`  - ${slug}`)
        }
        console.log('')
        return
      }

      const categories = validateCategories(options)

      console.log('🚀 Starting POI seed...\n')

      const config = loadConfig(true) // Require Convex config
      const { boundingBox } = config
      console.log('✓ Configuration loaded')
      console.log(
        `  Bounding box: [${boundingBox.minLat}, ${boundingBox.minLon}] to [${boundingBox.maxLat}, ${boundingBox.maxLon}]\n`,
      )

      const pois = await fetcher.fetch({ boundingBox, categories })

      if (options.dryRun) {
        logPOIResults(pois, { ...options, categories, dto: true }, true)
        return
      }

      console.log(`\n📊 Total POIs fetched: ${pois.length}\n`)

      if (pois.length === 0) {
        console.log('No POIs to import.')
        return
      }
      const allImports = mapper.batchImportDto(pois, categories)
      // const allImports = mapPOIsToImportDTOs(pois, categories)
      console.log(`✓ Mapped ${allImports.length} POIs to import format\n`)

      // Initialize Convex client and fetch categories
      console.log('Connecting to Convex...')
      const client = new ConvexPOIClient(config)
      await client.setup()
      console.log(`✓ Connected. Found ${client.categories.length} categories in database\n`)

      // TODO: Resolve category IDs from slugs
      // TODO: Convert POIImportDto to ConvexPOIDto
      // TODO: Call client.createPOIsBatch()
      console.log('⚠️  Category resolution and POI creation not yet implemented')
      console.log('Next steps:')
      console.log('  1. Build category slug → ID mapping using client.getCategoryBySlug()')
      console.log('  2. Convert POIImportDto to ConvexPOIDto')
      console.log('  3. Call client.createPOIsBatch(convexPOIs)')
    } catch (error) {
      console.error('\n❌ Error during seed:', error)
      process.exit(1)
    }
  })

program.parse()
