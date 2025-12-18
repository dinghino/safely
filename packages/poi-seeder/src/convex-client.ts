import { ConvexHttpClient } from 'convex/browser'
import type { Config } from './config.js'
import type { ConvexPOIDto } from './mapper.js'
import type { PoiCategory } from '@workspace/backend/types'
import { api } from '@workspace/backend/api'
/**
 * Convex client wrapper for POI operations
 */
export class ConvexPOIClient {
  private client: ConvexHttpClient
  public categories: PoiCategory[]

  constructor(config: Config) {
    if (!config.convexUrl) {
      throw new Error('Convex URL is required')
    }
    this.client = new ConvexHttpClient(config.convexUrl)
    this.categories = []
  }

  async setup() {
    this.categories = await this.client.query(api.pois.categories.all)
  }

  getCategoryBySlug(slug: string): PoiCategory | undefined {
    return this.categories.find((cat) => cat.slug === slug)
  }

  /**
   * Create a single POI
   *
   * Note: This assumes you have a mutation in your Convex backend
   * at convex/pois/mutations.ts with a createPOI function
   */
  async createPOI(poi: ConvexPOIDto): Promise<string> {
    try {
      // Replace "pois:createPOI" with your actual mutation path
      const result = await this.client.mutation(
        'pois:createPOI' as any, // Type assertion for now
        poi,
      )
      return result as string // Assumes it returns the POI ID
    } catch (error) {
      console.error('Failed to create POI:', poi.name, error)
      throw error
    }
  }

  /**
   * Create multiple POIs in batch
   *
   * Note: For better performance, consider implementing a batch mutation
   * in your Convex backend that accepts an array of POIs
   */
  async createPOIsBatch(pois: ConvexPOIDto[]): Promise<string[]> {
    const ids: string[] = []

    for (const poi of pois) {
      try {
        const id = await this.createPOI(poi)
        ids.push(id)
        console.log(`✓ Created POI: ${poi.name} (${id})`)
      } catch (error) {
        console.error(`✗ Failed to create POI: ${poi.name}`, error)
        // Continue with other POIs
      }
    }

    return ids
  }
}
