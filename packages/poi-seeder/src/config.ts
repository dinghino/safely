import { z } from 'zod'

/**
 * Bounding box for map boundaries
 */
export const boundingBoxSchema = z.object({
  minLat: z.number(),
  maxLat: z.number(),
  minLon: z.number(),
  maxLon: z.number(),
})

export type BoundingBox = z.infer<typeof boundingBoxSchema>

/**
 * Configuration schema for the POI seeder
 */
export const configSchema = z.object({
  // Optional for fetch-only mode
  convexUrl: z.url().optional(),

  // Map boundaries
  boundingBox: boundingBoxSchema,
})

export type Config = z.infer<typeof configSchema>

/**
 * Load and validate configuration from environment
 */
export function loadConfig(requireConvex = false): Config {
  const config = {
    convexUrl: process.env.CONVEX_URL,
    boundingBox: {
      minLat: Number(process.env.BBOX_MIN_LAT),
      maxLat: Number(process.env.BBOX_MAX_LAT),
      minLon: Number(process.env.BBOX_MIN_LON),
      maxLon: Number(process.env.BBOX_MAX_LON),
    },
  }

  const parsed = configSchema.parse(config)

  // If we need Convex, validate URL is present
  if (requireConvex && !parsed.convexUrl) {
    throw new Error('Convex configuration required: CONVEX_URL')
  }

  return parsed
}
