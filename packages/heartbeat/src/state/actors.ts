import { fromCallback, fromPromise } from 'xstate'
import type { Heartbeat } from './types'

/**
 * todo: extract from machine file
 * Since this machine is used in a react component that already has access to the geolocation actor,
 * we can just hook up to it using a callback actor that listens to events and sends them back
 * to the heartbeat machine, or even through a useEffect hook.
 *
 * This would have the benefit to reduce coupling between the actors, leaving only the
 * location data type as weak link (which we could migrate or even have a transformer function),
 * allowing us to move everything in distinct packages.
 *
 * This init actor (or in hook) would be in charge of linking the event systems of
 * both actors and/or telling the heartbeat that it can(not) have the location if
 * we don't want to send it, without having to touch the state machine.
 */
export const linkGeolocator: Heartbeat.Actors['setup'] = fromCallback(({ sendBack, input }) => {
  const { service } = input
  if (!service) {
    console.warn('No geolocator service provided to heartbeat state machine')
    return () => {}
  }
  const location = service.on('LOCATION_UPDATE', ({ data }) => {
    sendBack({ type: 'locationUpdate', location: data })
  })
  const canGeolocate = service.on('READY', () => sendBack({ type: 'canGeolocate' }))
  const snapshot = service.getSnapshot()
  // if the service has permissions, send the event immediately
  if (snapshot.context.permissionStatus === 'granted') {
    sendBack({ type: 'canGeolocate' })
  }
  // if it already has a location, send it immediately
  if (snapshot.context.data) {
    sendBack({ type: 'locationUpdate', location: snapshot.context.data })
  }
  return () => {
    location.unsubscribe()
    canGeolocate.unsubscribe()
  }
})

export const defaultGetPositionActor: Heartbeat.Actors['getPosition'] = fromPromise(
  async ({ input }) => {
    const { service, options } = input

    if (!service) {
      return Promise.reject(new Error('No geolocator service provided to heartbeat state machine'))
    }

    return new Promise((resolve) => {
      const sub = service?.on('LOCATION_UPDATE', ({ data }) => {
        sub.unsubscribe()
        resolve(data)
      })
      service?.send({ type: 'GET_POSITION', options })
    })
  },
)
