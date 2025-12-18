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
  private _initialized = false

  constructor(config: Config) {
    if (!config.convexUrl) {
      throw new Error('Convex URL is required')
    }
    this.client = new ConvexHttpClient(config.convexUrl)
    this.categories = []
  }

  async setup() {
    this.categories = await this.client.query(api.pois.categories.all)
    this._initialized = true
  }

  /**
   * Retrieve category details by slug from our cached categories
   * @param slug category slug from DTO data
   * @returns category data or undefined if not found
   */
  getCategoryBySlug(slug: string): PoiCategory | undefined {
    return this.categories.find((cat) => cat.slug === slug)
  }

  /**
   * Create a single POI
   *
   * Note: This assumes you have a mutation in your Convex backend
   * at convex/pois/mutations.ts with a createPOI function
   * fixme: this obviously does not work
   */
  async createPOI(poi: ConvexPOIDto): Promise<string> {
    if (!this._initialized) {
      throw new Error('ConvexPOIClient not initialized. await setup() first.')
    }
    throw new Error('Not implemented yet')
  }

  /**
   * Create multiple POIs in batch
   *
   * Note: For better performance, consider implementing a batch mutation
   * in your Convex backend that accepts an array of POIs
   * fixme: this obviously does not work
   */
  async createPOIsBatch(pois: ConvexPOIDto[]): Promise<string[]> {
    if (!this._initialized) {
      throw new Error('ConvexPOIClient not initialized. await setup() first.')
    }
    throw new Error('Not implemented yet')
    // const ids: string[] = []

    // for (const poi of pois) {
    //   try {
    //     const id = await this.createPOI(poi)
    //     ids.push(id)
    //     console.log(`✓ Created POI: ${poi.name} (${id})`)
    //   } catch (error) {
    //     console.error(`✗ Failed to create POI: ${poi.name}`, error)
    //     // Continue with other POIs
    //   }
    // }

    // return ids
  }
}
