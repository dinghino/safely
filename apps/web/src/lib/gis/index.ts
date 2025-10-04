type Position = { latitude: number; longitude: number }

export function nearby(c1: Position, c2: Position, radiusMeters = 5) {
  const R = 6371000 // Earth's radius in meters
  const φ1 = (c1.latitude * Math.PI) / 180
  const φ2 = (c2.latitude * Math.PI) / 180
  const Δφ = ((c2.latitude - c1.latitude) * Math.PI) / 180
  const Δλ = ((c2.longitude - c1.longitude) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // Distance in meters
  return distance <= radiusMeters
}
