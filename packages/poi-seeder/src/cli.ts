#!/usr/bin/env bun
import { Command } from 'commander'
import { config as dotenvConfig } from 'dotenv'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { OSMAdapter } from './adapters/osm.js'
import { GeoJSONAdapter } from './adapters/geojson.js'
import { loadConfig } from './config.js'
import { ConvexPOIClient } from './convex-client.js'
import { mapBatchToConvexPOIs, type CategoryMapping } from './mapper.js'
import type { Id } from '@workspace/backend/dataModel'
import { buildOverpassQuery, defaultOSMCategoryMappings } from './osm-mappings.js'

// Load .env file
dotenvConfig()

const program = new Command()

program
  .name('poi-seeder')
  .description('POI seeder for importing data from OSM and other sources')
  .version('0.1.0')

program
  .command('fetch')
  .description('Fetch POIs from OSM and log to console (no Convex write)')
  .option('-c, --categories <slugs...>', 'Category slugs to fetch (e.g., dog-park veterinary)')
  .option('--list-categories', 'List available category mappings')
  .option('--dto', 'Show Convex DTO mapping (requires author ID in .env)')
  .action(async (options) => {
    try {
      // List categories if requested
      if (options.listCategories) {
        console.log('\n📋 Available OSM category mappings:\n')
        for (const mapping of defaultOSMCategoryMappings) {
          console.log(`  ${mapping.categorySlug}`)
          console.log(`    Name: ${mapping.name}`)
          console.log(
            `    OSM tags: ${mapping.osmQueries
              .map((q) =>
                Object.entries(q.tags)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(' AND '),
              )
              .join(' OR ')}`,
          )
          console.log('')
        }
        return
      }

      if (!options.categories || options.categories.length === 0) {
        console.error('❌ Error: --categories is required (or use --list-categories)')
        console.log('\nExample:')
        console.log('  bun run fetch --categories dog-park veterinary')
        process.exit(1)
      }

      console.log('🚀 Fetching POIs from OpenStreetMap...\n')

      // Load config (no Convex required)
      const config = loadConfig(false)
      console.log('✓ Configuration loaded')
      console.log(
        `  Bounding box: [${config.boundingBox.minLat}, ${config.boundingBox.minLon}] to [${config.boundingBox.maxLat}, ${config.boundingBox.maxLon}]\n`,
      )

      const adapter = new OSMAdapter()
      const allPOIs = []

      // Fetch each category
      for (const categorySlug of options.categories) {
        const mapping = defaultOSMCategoryMappings.find((m) => m.categorySlug === categorySlug)

        if (!mapping) {
          console.warn(`⚠️  Unknown category: ${categorySlug} (skipping)`)
          console.log('   Use --list-categories to see available categories\n')
          continue
        }

        console.log(`📍 Fetching: ${mapping.name} (${categorySlug})`)

        const query = buildOverpassQuery(mapping, config.boundingBox)
        const pois = await adapter.fetch(query)

        console.log(`✓ Found ${pois.length} POIs for ${mapping.name}\n`)
        allPOIs.push(...pois)
      }

      console.log(`\n📊 Total POIs fetched: ${allPOIs.length}\n`)

      if (allPOIs.length > 0) {
        console.log('Sample Source POIs:')
        console.log(JSON.stringify(allPOIs.slice(0, 3), null, 2))

        if (allPOIs.length > 3) {
          console.log(`\n...and ${allPOIs.length - 3} more`)
        }

        // Show Convex DTO mapping if requested
        if (options.dto) {
          console.log('\n\n📦 Convex DTO Preview:\n')
          
          const config = loadConfig(false)
          if (!config.poiAuthorId) {
            console.error('❌ POI_AUTHOR_ID required in .env for DTO mapping')
            return
          }

          const categoryMapping: CategoryMapping = new Map()
          const defaultCategoryId = 'placeholder_category_id' as Id<'poiCategory'>

          const convexPOIs = mapBatchToConvexPOIs(allPOIs.slice(0, 3), {
            authorId: config.poiAuthorId as Id<'users'>,
            categoryMapping,
            defaultCategoryId,
          })

          console.log(JSON.stringify(convexPOIs, null, 2))
          console.log(`\n...${allPOIs.length - 3} more would be mapped`)
        }
      }
    } catch (error) {
      console.error('\n❌ Error during fetch:', error)
      process.exit(1)
    }
  })

program
  .command('seed')
  .description('Seed POIs from a source file')
  .requiredOption('-s, --source <type>', 'Source type: osm, geojson')
  .requiredOption('-f, --file <path>', 'Path to the source file')
  .option('-c, --category <id>', 'Default category ID to use for POIs')
  .option('--dry-run', 'Parse and map POIs without writing to Convex')
  .action(async (options) => {
    try {
      console.log('🚀 Starting POI seed...\n')

      // Load configuration
      const config = loadConfig()
      console.log('✓ Configuration loaded')

      // Read source file
      const filePath = resolve(options.file)
      const fileContent = await readFile(filePath, 'utf-8')
      const sourceData = JSON.parse(fileContent)
      console.log(`✓ Loaded source file: ${filePath}\n`)

      // Select adapter
      const adapter = options.source === 'osm' ? new OSMAdapter() : new GeoJSONAdapter()

      if (!adapter.validate(sourceData)) {
        console.error(`✗ Invalid ${options.source} data format`)
        process.exit(1)
      }
      console.log(`✓ Data validated for ${options.source} format`)

      // Parse POIs
      const sourcePOIs = await adapter.parse(sourceData)
      console.log(`✓ Parsed ${sourcePOIs.length} POIs from source\n`)

      if (sourcePOIs.length === 0) {
        console.log('No POIs to import. Exiting.')
        return
      }

      // Show sample POI
      console.log('Sample POI:')
      console.log(JSON.stringify(sourcePOIs[0], null, 2))
      console.log('')

      // Create category mapping (simplified for now)
      // TODO: Fetch actual categories from Convex and build mapping
      const categoryMapping: CategoryMapping = new Map()
      const defaultCategoryId = (options.category || 'placeholder_category_id') as Id<'poiCategory'>

      // Map to Convex DTOs
      const convexPOIs = mapBatchToConvexPOIs(sourcePOIs, {
        authorId: config.poiAuthorId as Id<'users'>,
        categoryMapping,
        defaultCategoryId,
      })
      console.log(`✓ Mapped ${convexPOIs.length} POIs to Convex schema\n`)

      // Dry run - just show what would be created
      if (options.dryRun) {
        console.log('Dry run mode - POIs that would be created:')
        console.log(JSON.stringify(convexPOIs.slice(0, 3), null, 2))
        console.log(`\n...and ${convexPOIs.length - 3} more`)
        console.log('\n✓ Dry run complete. No data was written to Convex.')
        return
      }

      // Create POIs in Convex
      console.log('Writing POIs to Convex...\n')
      const client = new ConvexPOIClient(config)

      const ids = await client.createPOIsBatch(convexPOIs)
      console.log(`\n✅ Successfully created ${ids.length} POIs!`)
    } catch (error) {
      console.error('\n❌ Error during seed:', error)
      process.exit(1)
    }
  })

program.parse()
