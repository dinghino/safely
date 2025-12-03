/**
 * @file Geographic utility functions for Convex backend.
 * 
 */
import type { Point } from '@convex-dev/geospatial'

// Utility functions for geographic calculations
export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

export const metersToLat = (meters: number): number => meters / 111_111

export const metersToLng = (meters: number, latitude: number): number =>
  meters / (111_111 * Math.cos(toRadians(latitude)))

/**
 * Calculate the distance in meters between two geographic points using the Haversine formula.
 * @note for the distances we expect to use this for (track sessions) this is a
 *       bit overkill, but it is accurate and we can use it later to get distance
 *       between POIs and other more complex calculations.
 */
export function distanceInMeters(p1: Point, p2: Point): number {
  const R = 6371000 // Earth's radius in meters
  const φ1 = toRadians(p1.latitude)
  const φ2 = toRadians(p2.latitude)
  const Δφ = toRadians(p2.latitude - p1.latitude)
  const Δλ = toRadians(p2.longitude - p1.longitude)

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
