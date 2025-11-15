import dayjs from '@/lib/dayjs'
import type { DeviceLogEntry, DeviceLogPayload, DeviceLogType } from './types'
import { generateId } from '@/lib/nanoid'
import type { Dayjs } from 'dayjs'
import type { Id } from '@workspace/backend/types'

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

const deviceId = 'jd729zvqqbbtdzgaj47dh0wmg17tbf61' as Id<'devices'>
const sessionId = 'jn70begr5ps8aw6t5wn736t1gs7td2dn' as Id<'trackSession'>

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
const gianni = {
  _id: 'j9790rsfqqgvpm43qp3h9sfbcx7qv2a0',
  username: 'giamba',
  image:
    'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMnRESjlkcHo5WDFQN0YxU0loSTRsbmlCODIifQ',
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
    args: { title?: string; payload: DeviceLogPayload<T> },
    add: [offset: number, unit?: dayjs.ManipulateType | undefined][] = [],
  ): this {
    for (const [offset, unit] of add) {
      // random seconds between 5 and 25
      const seconds = 5 + Math.floor(Math.random() * 20)
      this.last = this.last.add(offset, unit).add(seconds, 'second')
    }
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
  .add('registered', { payload: {} })
  .add('connected', { payload: {} }, [[1, 'hour']])
  .add('shared', { payload: { users: [gianni] } }, [[7, 'hour']])
  .add('shared', { payload: { users: [toma] } }, [[7, 'hour']])
  .add('shared', { payload: { users: [macca] } }, [[7, 'hour']])
  .add('disconnected', { payload: {} }, [[30, 'minutes']])
  .add('unshared', { payload: { users: [macca] } }, [[2, 'hour']])
  .add('connected', { payload: {} }, [[3, 'hour']])
  .add('request_issued', { payload: { requestId: 'req_123' }, title: 'Tracking request' }, [
    [1, 'day'],
  ])
  .add('request_acknowledged', { payload: { requestId: 'req_123' } }, [[3, 'second']])
  .add('session_started', { payload: { sessionId } }, [[1, 'day']])
  .add('disconnected', { payload: {} }, [[25, 'minutes']])
  .add('connected', { payload: {} }, [[3, 'minutes']])
  .add('session_ended', { payload: { sessionId } }, [[2, 'hour']])
  .add('session_shared', { payload: { sessionId, users: [gianni] } }, [[5, 'minutes']])
  .add('disconnected', { payload: {} }, [[5, 'hour']])
  .unwrap()
export default logs
