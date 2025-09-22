import type { LocationData } from '@/entities/location/types'

/** IGNORE THIS CLASS FOR NOW */
export class LocationManager {
  state: {
    data: LocationData | null
    watchId: number | null
    lastUpdate: number | null
  }
  listeners: Set<() => void>
  constructor() {
    this.listeners = new Set()

    this.state = {
      data: null,
      watchId: null,
      lastUpdate: null,
    }
  }

  handleSuccess = (position: GeolocationPosition) => {
    this.state.data = transformPosition(position)
    this.state.lastUpdate = Date.now()
  }
  handleError = (error: GeolocationPositionError) => {
    console.error('Geolocation error:', error)
  }

  get(opts: PositionOptions = {}): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (data) => {
          this.handleSuccess(data)
          resolve(this.state.data!)
        },
        (error) => {
          this.handleError(error)
          reject(error)
        },
        opts,
      )
    })
  }
  watch(opts: PositionOptions = {}) {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      return
    }
    if (this.state.watchId !== null) {
      // Already watching
      return
    }
    this.state.watchId = navigator.geolocation.watchPosition(
      this.handleSuccess,
      this.handleError,
      opts,
    )
  }
}

const transformPosition = (position: GeolocationPosition): LocationData => {
  return {
    point: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },
    metadata: {
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
    },
  }
}
