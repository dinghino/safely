import type { LocationMetadata } from '@workspace/backend/types'

export type Point = { latitude: number; longitude: number }
export type LocationData = { point: Point; metadata: LocationMetadata }

export namespace Locator {
  export interface Options {
    enableHighAccuracy?: boolean
    maximumAge?: number
    timeout?: number
  }

  export type Data = LocationData & { timestamp: number }

  export interface AsyncOptions extends Options {
    onUpdate: (data: Data) => void
    onError?: <E extends LocatorError>(error: E) => void
  }
  export type Status = 'granted' | 'denied' | 'prompt' | 'unavailable' | 'timeout'

  export class LocatorError extends Error {
    name = 'LocatorError'
    constructor(
      public type: Omit<Status, 'granted' | 'prompt'>,
      message: string,
    ) {
      super(message)
    }
  }

  export type WatchHandle = {
    watchId: number
    stop: () => void
  }

  export interface Provider {
    /** Check if the device can geolocate */
    canGeolocate(): boolean
    /** get current permission status */
    getPermissionStatus(): Status
    /**
     * Request permission to access geolocation.
     * Should return the current status regardless of outcome,
     * to be handled and thrown by the caller as needed.
     */
    requestPermission(): Promise<Status>
    /** Get the current position once */
    getCurrentPosition(options: Options): Promise<Data>
    /** Start watching position changes */
    watchPosition(options: AsyncOptions): WatchHandle
    /** Clear a watch by its ID */
    clearWatch(watchId: number): void
  }
}
