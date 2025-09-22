import type { LocationMetadata } from '@workspace/backend/types'

export type Point = { latitude: number; longitude: number }
export type LocationData = { point: Point; metadata: LocationMetadata }
