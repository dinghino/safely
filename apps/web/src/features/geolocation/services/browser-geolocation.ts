import { transformPosition } from '@/entities/location/lib'
import { Locator } from '@workspace/geolocation/types'

export interface Options extends Locator.Options {
  timeout?: number
  maximumAge?: number
  enableHighAccuracy?: boolean
}

export class BrowserGeolocationProvider implements Locator.Provider {
  status: Locator.Status = 'prompt'
  cached: Locator.Data | null = null
  watchId: number | null = null
  timestamp = -1

  constructor(public options: Options = {}) {}

  getPermissionStatus(): Locator.Status {
    return this.status
  }
  requestPermission(): Promise<Locator.Status> {
    /// use permissions API if available to check existing status. some browsers
    // (e.g. iOS Safari) do not support it
    async function checkExisting() {
      if (!navigator || !('permissions' in navigator)) {
        return undefined
      }
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state
    }

    return new Promise<Locator.Status>((resolve, reject) => {
      // if browser supports permissions API we get the existing permission
      // status first to avoid unnecessary prompts
      checkExisting()
        .then((permission) => {
          if (!permission) return

          if (permission === 'granted') {
            this.status = 'granted'
            return resolve('granted')
          }
          if (permission === 'denied') {
            this.status = 'denied'
            throw new Locator.LocatorError('denied', 'Geolocation permission denied')
          }
        })
        .then(() => {
          // ping the geolocation api for a position to request permissions
          // i don't think there is a way to just request permissions without
          // actually trying to get a position. we don't care much about the result
          // here, just the permission prompt
          return this.getCurrentPosition({
            timeout: 1000 * 60 * 10,
            enableHighAccuracy: false,
            maximumAge: Number.POSITIVE_INFINITY,
          }).then(
            () => resolve('granted'),
            (err) => reject(err),
          )
        })
        .catch((error) => {
          if (error instanceof Locator.LocatorError) {
            return reject(error)
          }
          console.error('Error checking existing geolocation permission', error)
          reject(
            new Locator.LocatorError('unknown', 'Error checking existing geolocation permission'),
          )
        })
    })
  }
  async getCurrentPosition(options: Locator.Options): Promise<Locator.Data> {
    const geo = await new Promise<Locator.Data>((resolve, reject) => {
      if (!this.canGeolocate()) return reject('unavailable')

      if (this.isValidCache(options.maximumAge || 0)) {
        return resolve(this.cached)
      }

      navigator.geolocation.getCurrentPosition(
        this.handleSuccess(resolve),
        this.handleError(reject),
        { timeout: this.options.timeout, ...options },
      )
    })
    this.cached = geo
    this.timestamp = Date.now()
    return geo
  }
  canGeolocate(): boolean {
    return navigator && 'geolocation' in navigator
  }

  watchPosition(options: Locator.AsyncOptions): Locator.WatchHandle {
    const { onUpdate, onError } = options

    // assume we already checked that we can set up a watch, so that the geolocator
    // api exists in our context. Since this object is meant to be run inside
    // a state machine, we should have already checked capabilities
    if (!this.canGeolocate()) {
      throw new Locator.LocatorError('unavailable', 'Geolocation is not available on this device')
    }

    if (this.watchId) {
      this.clearWatch(this.watchId)
    }

    const watchId = navigator.geolocation.watchPosition(
      this.handleSuccess(onUpdate),
      this.handleError(onError),
      options,
    )
    return {
      watchId,
      stop: () => navigator.geolocation.clearWatch(watchId),
    }
  }
  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId)
  }

  private handleSuccess(cb?: (data: Locator.Data) => void): (data: GeolocationPosition) => void {
    return (data: GeolocationPosition) => {
      this.timestamp = data.timestamp
      this.cached = this.transformPosition(data)
      cb?.(this.cached)
    }
  }

  private handleError(
    cb?: (error: Locator.LocatorError) => void,
  ): (error: GeolocationPositionError) => void {
    return (error: GeolocationPositionError) => {
      this.status = this.mapErrorCode(error)
      const err = new Locator.LocatorError(this.status, 'Geolocation watch error')
      cb?.(err)
    }
  }

  private isValidCache(maxAge: number): this is { cached: Locator.Data } {
    if (!this.cached) return false
    const now = Date.now()
    return this.cached && now - this.timestamp < maxAge
  }

  private transformPosition(data: GeolocationPosition): Locator.Data {
    return { ...transformPosition(data), timestamp: this.timestamp }
  }

  private mapErrorCode(error: GeolocationPositionError): Locator.Status {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'denied'
      case error.POSITION_UNAVAILABLE:
        return 'unavailable'
      case error.TIMEOUT:
        return 'timeout'
      default:
        return 'unavailable'
    }
  }
}
