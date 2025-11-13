import dayjs from '@/lib/dayjs'
import type { DeviceLogEntry, DeviceLogPayload, DeviceLogType } from './types'
import { generateId } from '@/lib/nanoid'
import type { Dayjs } from 'dayjs'

function defaultTitleForType(type: DeviceLogType): string {
  switch (type) {
    case 'registered':
      return 'Device Registered'
    case 'unregistered':
      return 'Device Unregistered'
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
    default:
      return 'Device Log Entry'
  }
}

const deviceId = 'jd729zvqqbbtdzgaj47dh0wmg17tbf61'
const _sessionId = 'jn70begr5ps8aw6t5wn736t1gs7td2dn'

const macca = {
  _id: 'j972k3byqra36b4ep2xqfgyvgh7rfbfs',
  username: 'macca',
  image:
    'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zM0xHMkczcmFQRlhnWUowdkFqNkt6QjlRUnkifQ',
}
const toma = {
  _id: 'j974s4bm9cs3hbhmm7qvtjnt3d7qw0fy',
  username: 'toma',
  image:
    'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zMmtDbjUyRnBKb0psOE1WbVNJQ3dLYTdmWUIiLCJyaWQiOiJ1c2VyXzMydmxvd0RjdWhjR3RCcmhaVHNSZjJNeXdsdSIsImluaXRpYWxzIjoiQVQifQ',
}

class Logs {
  entries: DeviceLogEntry[]
  last: Dayjs
  constructor(
    private deviceId: string,
    public start: dayjs.Dayjs,
  ) {
    this.last = start
    this.entries = []
  }
  add<T extends DeviceLogType>(
    type: T,
    // args: Omit<DeviceLogEntry<T>, 'type' | 'deviceId' | '_id' | '_creationTime'>,
    args: {
      title?: string
      payload: DeviceLogPayload<T>
    },
    offset: number,
    unit?: dayjs.ManipulateType | undefined,
  ): this {
    this.last = this.last.add(offset, unit)
    const time = this.last.unix() * 1000
    const entry = {
      _id: generateId(),
      _creationTime: time,
      deviceId: this.deviceId,
      title: args.title ?? defaultTitleForType(type),
      type: type,
      payload: args.payload,
    } as DeviceLogEntry<T>
    this.entries.push(entry)
    return this
  }
  unwrap(): DeviceLogEntry[] {
    return this.entries
  }
}

// random log data for UI development
// IDs are hardcoded to match real and fake data in other places

const logs = new Logs(deviceId, dayjs().subtract(7, 'day'))
  .add('registered', { payload: {} }, 0)
  .add('connected', { payload: {} }, 1, 'hour')
  .add('shared', { payload: { users: [toma, macca] } }, 7, 'hour')
  .add('disconnected', { payload: {} }, 30, 'minutes')
  .add('unshared', { payload: { users: [macca] } }, 2, 'hour')
  .add('connected', { payload: {} }, 3, 'hour')
  .add('session_started', { payload: { sessionId: _sessionId } }, 1, 'day')
  .add('disconnected', { payload: {} }, 25, 'minutes')
  .add('connected', { payload: {} }, 3, 'minutes')
  .add('session_ended', { payload: { sessionId: _sessionId } }, 2, 'hour')
  .add('disconnected', { payload: {} }, 5, 'hour')
  .unwrap()
export default logs
