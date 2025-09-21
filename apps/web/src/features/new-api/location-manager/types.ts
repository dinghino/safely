import type { LocationMetadata } from '@workspace/backend/types'

export type Point = { latitude: number; longitude: number }
export type LocationData = { point: Point; metadata: LocationMetadata }

export interface LocationState {
  currentLocation: LocationData | null
  isWatching: boolean
  error: string | null
  lastUpdate: number | null
}

export interface DeviceLocationContextValue extends LocationState {
  startWatching: (options?: DeviceLocationManager.LocationOptions) => void
  stopWatching: () => void
  getCurrentLocation: (options?: DeviceLocationManager.LocationOptions) => Promise<LocationData>
}

export namespace DeviceLocationManager {
  export type LocationOptions = {
    highAccuracy?: boolean
  }
  export type Props = {
    children: React.ReactNode
  }
}
