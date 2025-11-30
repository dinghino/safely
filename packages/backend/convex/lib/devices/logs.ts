import type { Id } from '../../_generated/dataModel'
import type { DeviceLogPayload, DeviceLogType } from '../../schemas/device-activities.schema'

/**
 * Normalizes a default title for a given device activity type.
 * @param type Activity log type
 * @returns Default title for the given activity
 */
export function defaultTitleForActivityType(type: DeviceLogType): string {
  switch (type) {
    case 'registered':
      return 'Device Registered'
    case 'unregistered':
      return 'Device Unregistered'
    case 'ownership_changed':
      return 'Device Ownership Changed'
    case 'renamed':
      return 'Device Renamed'
    case 'connected':
      return 'Device Connected'
    case 'disconnected':
      return 'Device Disconnected'
    case 'shared':
      return 'Device Shared'
    case 'unshared':
      return 'Device Unshared'
    case 'session_started':
      return 'Session Started'
    case 'session_ended':
      return 'Session Ended'
    case 'registered_session':
      return 'Session Registered'
    case 'session_shared':
      return 'Session Shared'
    case 'request_issued':
      return 'Request Issued'
    case 'request_acknowledged':
      return 'Request Acknowledged'

    default:
      return 'Device Log Entry'
  }
}

export type CreateLogOptions<T extends DeviceLogType> = {
  type: T
  deviceId: Id<'devices'>
  payload: DeviceLogPayload<T>
}

export function createActivityLog<T extends DeviceLogType>(options: CreateLogOptions<T>) {
  const { deviceId, type, payload } = options
  return {
    deviceId,
    type,
    timestamp: Date.now(),
    title: defaultTitleForActivityType(type),
    payload,
  }
}
