import type { Id } from "@workspace/backend/types"

type DeviceAdded = {
  type: 'registered'
  payload: {}
}
type DeviceRemoved = {
  type: 'unregistered'
  payload: {}
}
// region heartbeat

type DeviceConnected = {
  type: 'connected'
  payload: {}
}
type DeviceDisconnected = {
  type: 'disconnected'
  payload: {}
}

// region social sharing

type SharedUserInfo = {
  _id: string // Id<'users'>
  username: string
  image: string
}

type DeviceShared = {
  type: 'shared'
  payload: { users: SharedUserInfo[] }
}
type DeviceUnshared = {
  type: 'unshared'
  payload: { users: SharedUserInfo[] }
}
// region tracking sessions

/** generic event for requests and various commands.
 * for now it only covers tracking requests.
 */
type RequestIssued = {
  type: 'request_issued'
  payload: {
    requestId: string // Id<'commands'>
  }
}

type RequestAcknowledged = {
  type: 'request_acknowledged'
  payload: {
    requestId: string // Id<'requests'>
  }
}

type SessionStarted = {
  type: 'session_started'
  payload: {
    sessionId: Id<'trackSession'>
  }
}
type SessionEnded = {
  type: 'session_ended'
  payload: {
    sessionId: Id<'trackSession'>
  }
}
type RegisteredSession = {
  type: 'registered_session'
  payload: {
    sessionId: Id<'trackSession'>
  }
}

// region public API

export type DeviceLogData =
  | DeviceAdded
  | DeviceRemoved
  | DeviceConnected
  | DeviceDisconnected
  | DeviceShared
  | DeviceUnshared
  | RequestIssued
  | RequestAcknowledged
  | SessionStarted
  | SessionEnded
  | RegisteredSession

export type DeviceLogType = DeviceLogData['type']

export type DeviceLogPayload<T extends DeviceLogType> = Extract<
  DeviceLogData,
  { type: T }
>['payload']

type DeviceLogEntryBase = {
  _id: string // Id<'device_log'>
  _creationTime: number // Unix timestamp in milliseconds
  deviceId: string // Id<'devices'>
  title: string
}

export type DeviceLogEntry<T extends DeviceLogType = DeviceLogType> = Extract<
  {
    [K in DeviceLogType]: DeviceLogEntryBase & {
      type: K
      payload: DeviceLogPayload<K>
    }
  }[DeviceLogType],
  { type: T }
>
