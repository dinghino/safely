import type { Id } from '@workspace/backend/dataModel'
import type { LocationMetadata } from '@workspace/backend/types'

import type { LocationMachine } from '@workspace/geolocation/types'

/**
 * this should match the api.tracking.addLocationPoint (or renamed) signature.
 * for type safety we will likely derive the type from the api directly later
 * using some magic or convex utility types.
 */
type AddOptions = {
  sessionId: Id<'trackSession'>
  point: { latitude: number; longitude: number }
  metadata?: LocationMetadata
}
type SendPosition = (options: AddOptions) => Promise<unknown>

export type Inputs = {
  /** initial session ID if we already have an active session */
  sessionId?: Id<'trackSession'> | null
  /**
   * timeout for sending position updates. fallbacks to default value if
   * not provided and should be updated via UPDATE_SETTINGS event when known
   * from the device settings.
   */
  updateTimeout?: number
  sendPosition: SendPosition
  locationActor: LocationMachine.Actor
  /** callback to create a new active session for this device */
  //  startSession: () => Promise<Id<'trackSession'> | false>
  closeSession: (options: { sessionId: Id<'trackSession'> }) => Promise<any>
}

type Settings = {
  interval: number
}

export type Context = Omit<Inputs, 'updateTimeout'> & {
  /**
   * active session ID. if undefined we still are waiting on the backend
   * otherwise it is either null (no active session) or a valid ID
   */
  sessionId: Id<'trackSession'> | null | undefined
  settings: Settings
  /** timestamp of the last sent position update to avoid duplicated */
  lastSent?: number
  // locationActor: LocationMachine.Actor
}

export type SendPositionPayload = Omit<AddOptions, 'sessionId'> & { timestamp: number }

export type Events =
  | { type: 'START_SESSION' }
  | { type: 'SEND_POSITION'; payload: SendPositionPayload }
  // | { type: 'SEND_POSITION' }
  | { type: 'SET_SESSION'; payload: { sessionId: Id<'trackSession'> } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'STOP_SESSION' }
  | { type: 'POSITION_SENT'; payload: { timestamp: number } }
  | { type: 'FAILED_TO_SEND'; error: string }
