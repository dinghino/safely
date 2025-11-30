/**
 * Schemas for device activity logs.
 *
 * @file Device activity logs, for activity feed, auditing and debugging purposes.
 * The shape of the log entries is designed to be extensible to accommodate
 * various types of activities related to devices, including registration,
 * connectivity changes, sharing actions, requests, and session events.
 * Each log entry includes a type discriminator to identify the kind of activity,
 * a timestamp, and a payload containing relevant data for that activity.
 *
 */
import { v } from 'convex/values'
import type { Infer } from 'convex/values'

// region Base

/**
 * Base fields for all device activity log entries.
 * @note these are spread into each specific log type below to avoid nesting
 * in the db collection due to convex limitations.
 */
const base = v.object({
  deviceId: v.id('devices'),
  timestamp: v.number(),
  title: v.string(),
})

// region event types
const ACTIVITY_TYPE = {
  ADDED: v.literal('registered'),
  UNREGISTERED: v.literal('unregistered'),
  RENAMED: v.literal('renamed'),
  OWNERSHIP_CHANGED: v.literal('ownership_changed'),
  CONNECTED: v.literal('connected'),
  DISCONNECTED: v.literal('disconnected'),
  SHARED: v.literal('shared'),
  UNSHARED: v.literal('unshared'),
  REQUEST_ISSUED: v.literal('request_issued'),
  REQUEST_ACKNOWLEDGED: v.literal('request_acknowledged'),
  SESSION_STARTED: v.literal('session_started'),
  SESSION_ENDED: v.literal('session_ended'),
  REGISTERED_SESSION: v.literal('registered_session'),
  SESSION_SHARED: v.literal('session_shared'),
} as const

// region Platform

/**
 * Logged when a device is initially registered
 * on the platform.
 */
export const deviceAdded = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.ADDED,
  payload: v.object({}),
})

/**
 * Logged when a device is unregistered from the platform.
 * @note 11/2025: unregistered devices are currently deleted so this won't likely
 *       be used until we implement soft deletes or archiving.
 */
export const deviceUnregistered = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.UNREGISTERED,
  payload: v.object({}),
})

/**
 * Logged when a device ownership changes from one user to another.
 * @note 11/2025: functionality not implemented yet
 */
export const ownershipChanged = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.OWNERSHIP_CHANGED,
  payload: v.object({
    newOwnerId: v.id('users'),
    previousOwnerId: v.id('users'),
  }),
})

export const deviceRenamed = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.RENAMED,
  payload: v.object({
    newName: v.string(),
    previousName: v.string(),
  }),
})

// region Connectivitiy

/**
 * Logged when a device connects to the platform (comes online).
 */
export const deviceConnected = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.CONNECTED,
  payload: v.object({}),
})

/**
 * Logged when a device disconnects from the platform (goes offline).
 */
export const deviceDisconnected = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.DISCONNECTED,
  payload: v.object({}),
})

// region Social sharing

/**
 * Logged when a device is shared with other users.
 * @note actual user information needs to be retrieved when processing the
 * request, only user IDs are stored here.
 */
export const deviceShared = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.SHARED,
  payload: v.object({ users: v.array(v.id('users')) }),
})

/** Logged when a device is unshared from other users.
 * @note actual user information needs to be retrieved when processing the
 * request, only user IDs are stored here.
 */
export const deviceUnshared = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.UNSHARED,
  payload: v.object({ users: v.array(v.id('users')) }),
})

// region Requests

/**
 * Generic event for requests and various commands.
 * For now it only covers tracking requests.
 */
export const requestReceived = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.REQUEST_ISSUED,
  payload: v.object({
    requestId: v.id('commands'),
  }),
})

export const requestAcknowledged = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.REQUEST_ACKNOWLEDGED,
  payload: v.object({
    requestId: v.id('requests'),
  }),
})

// region Sessions

export const sessionStarted = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.SESSION_STARTED,
  payload: v.object({
    sessionId: v.id('deviceSessions'),
  }),
})

export const sessionEnded = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.SESSION_ENDED,
  payload: v.object({
    sessionId: v.id('deviceSessions'),
  }),
})

/**
 * Logged when a session is closed, either by the device, server or the user.
 * This is the same as sessionEnded but should be used to keep track of all
 * the session metadata when a session is closed to make it easier to query
 * later.
 */
export const registeredSession = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.REGISTERED_SESSION,
  payload: v.object({
    sessionId: v.id('deviceSessions'),
    // todo: add session summary data?
  }),
})

/**
 * Logged when a session is shared with other users.
 * @note 11/2025: information about users need to be retrieved when querying the log,
 *       as well as session metadata for now.
 */
export const sessionShared = v.object({
  ...base.fields,
  type: ACTIVITY_TYPE.SESSION_SHARED,
  payload: v.object({
    sessionId: v.id('deviceSessions'),
    users: v.array(v.id('users')),
  }),
})

// region Public API

/**
 * Union type of all device activity types, exported for sanity in actual APIs.
 */
export const deviceActivityType = v.union(
  ACTIVITY_TYPE.ADDED,
  ACTIVITY_TYPE.UNREGISTERED,
  ACTIVITY_TYPE.OWNERSHIP_CHANGED,
  ACTIVITY_TYPE.RENAMED,
  ACTIVITY_TYPE.CONNECTED,
  ACTIVITY_TYPE.DISCONNECTED,
  ACTIVITY_TYPE.SHARED,
  ACTIVITY_TYPE.UNSHARED,
  ACTIVITY_TYPE.REQUEST_ISSUED,
  ACTIVITY_TYPE.REQUEST_ACKNOWLEDGED,
  ACTIVITY_TYPE.SESSION_STARTED,
  ACTIVITY_TYPE.SESSION_ENDED,
  ACTIVITY_TYPE.REGISTERED_SESSION,
  ACTIVITY_TYPE.SESSION_SHARED,
)

/**
 * Union type of all device activity log entries.
 */
export const deviceActivityEvent = v.union(
  deviceAdded,
  deviceUnregistered,
  ownershipChanged,
  deviceRenamed,
  deviceConnected,
  deviceDisconnected,
  deviceShared,
  deviceUnshared,
  requestReceived,
  requestAcknowledged,
  sessionStarted,
  sessionEnded,
  registeredSession,
  sessionShared,
)

type DeviceActivityLogUnion = Infer<typeof deviceActivityEvent>

export type DeviceLogType = DeviceActivityLogUnion['type']
export type DeviceActivityLog<T extends DeviceLogType = DeviceLogType> = Extract<
  DeviceActivityLogUnion,
  { type: T }
>
export type DeviceLogPayload<T extends DeviceLogType> = DeviceActivityLog<T>['payload']
