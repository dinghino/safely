import { ConvexHttpClient } from 'convex/browser'
import type { Config } from './config.js'
import type { ConvexPOIDto } from './mapper.js'

/**
 * Convex client wrapper for POI operations
 */
export class ConvexPOIClient {
  private client: ConvexHttpClient

  constructor(config: Config) {
    if (!config.convexUrl || !config.convexDeployKey) {
      throw new Error('Convex configuration is missing')
    }
    this.client = new ConvexHttpClient(config.convexUrl)
    this.client.setAuth(config.convexDeployKey)
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
