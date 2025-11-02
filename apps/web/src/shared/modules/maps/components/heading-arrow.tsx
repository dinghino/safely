'use client'
import * as gis from '@/lib/gis'
import { Polygon } from 'react-leaflet'

type HeadingIndicatorProps = {
  /** position of the entity we're showing the heading of */
  position: [number, number] | null
  /** heading in degrees */
  heading: number | null | undefined
  /**
   * distance from the entity (in meters) acting as offset
   * usually the radius of the entity indicator
   */
  distance: number
  /** length of the arrow in meters */
  length?: number
  /** width of the arrow base in meters */
  width?: number
}

export function HeadingIndicator(props: HeadingIndicatorProps) {
  const { position, heading, distance, length = 3, width = 2 } = props
  if (!position || heading == null) return null

  const [lat, lng] = position

  // Offset the arrow base from the user position
  const arrowBase = offsetPosition(lat, lng, distance, heading)

  // Triangle dimensions in meters

  // Create triangle arrow pointing in heading direction
  const triangleVertices = createTriangleArrow(arrowBase.lat, arrowBase.lng, heading, length, width)

  return (
    <Polygon
      pathOptions={{ color: 'blue', stroke: false, fillColor: 'blue', fillOpacity: 1, weight: 1 }}
      positions={triangleVertices}
    />
  )
}

export const offsetPosition = (
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingDegrees: number,
): { lat: number; lng: number } => {
  const bearingRad = gis.toRadians(bearingDegrees)
  return {
    lat: lat + gis.metersToLat(distanceMeters * Math.cos(bearingRad)),
    lng: lng + gis.metersToLng(distanceMeters * Math.sin(bearingRad), lat),
  }
}

export const createTriangleArrow = (
  centerLat: number,
  centerLng: number,
  headingDegrees: number,
  arrowLength: number,
  arrowBaseWidth: number,
): Array<{ lat: number; lng: number }> => {
  // Calculate the three vertices of the triangle
  const tip = offsetPosition(centerLat, centerLng, arrowLength, headingDegrees)

  // Base corners are perpendicular to heading direction
  const leftBase = offsetPosition(centerLat, centerLng, arrowBaseWidth / 2, headingDegrees - 90)
  const rightBase = offsetPosition(centerLat, centerLng, arrowBaseWidth / 2, headingDegrees + 90)

  return [tip, leftBase, rightBase]
}
