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

// region Platform

/**
 * Logged when a device is initially registered
 * on the platform.
 */
export const deviceAdded = v.object({
  ...base.fields,
  type: v.literal('registered'),
  payload: v.object({}),
})

/**
 * Logged when a device is unregistered from the platform.
 * @note 11/2025: unregistered devices are currently deleted so this won't likely
 *       be used until we implement soft deletes or archiving.
 */
export const deviceUnregistered = v.object({
  ...base.fields,
  type: v.literal('unregistered'),
  payload: v.object({}),
})

/**
 * Logged when a device ownership changes from one user to another.
 * @note 11/2025: functionality not implemented yet
 */
export const ownershipChanged = v.object({
  ...base.fields,
  type: v.literal('ownership_changed'),
  payload: v.object({
    newOwnerId: v.id('users'),
    previousOwnerId: v.id('users'),
  }),
})

// region Connectivitiy

/**
 * Logged when a device connects to the platform (comes online).
 */
export const deviceConnected = v.object({
  ...base.fields,
  type: v.literal('connected'),
  payload: v.object({}),
})

/**
 * Logged when a device disconnects from the platform (goes offline).
 */
export const deviceDisconnected = v.object({
  ...base.fields,
  type: v.literal('disconnected'),
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
  type: v.literal('shared'),
  payload: v.object({ users: v.array(v.id('users')) }),
})

/** Logged when a device is unshared from other users.
 * @note actual user information needs to be retrieved when processing the
 * request, only user IDs are stored here.
 */
export const deviceUnshared = v.object({
  ...base.fields,
  type: v.literal('unshared'),
  payload: v.object({ users: v.array(v.id('users')) }),
})

// region Requests

/**
 * Generic event for requests and various commands.
 * For now it only covers tracking requests.
 */
export const requestReceived = v.object({
  ...base.fields,
  type: v.literal('request_issued'),
  payload: v.object({
    requestId: v.id('commands'),
  }),
})

export const requestAcknowledged = v.object({
  ...base.fields,
  type: v.literal('request_acknowledged'),
  payload: v.object({
    requestId: v.id('requests'),
  }),
})

// region Sessions

export const sessionStarted = v.object({
  ...base.fields,
  type: v.literal('session_started'),
  payload: v.object({
    sessionId: v.id('deviceSessions'),
  }),
})

export const sessionEnded = v.object({
  ...base.fields,
  type: v.literal('session_ended'),
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
  type: v.literal('registered_session'),
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
  type: v.literal('session_shared'),
  payload: v.object({
    sessionId: v.id('deviceSessions'),
    users: v.array(v.id('users')),
  }),
})

// region Public API

export const deviceActivities = v.union(
  deviceAdded,
  deviceUnregistered,
  ownershipChanged,
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

type DeviceActivityLogUnion = Infer<typeof deviceActivities>

export type DeviceLogType = DeviceActivityLogUnion['type']
export type DeviceActivityLog<T extends DeviceLogType = DeviceLogType> = Extract<
  DeviceActivityLogUnion,
  { type: T }
>
export type DeviceLogPayload<T extends DeviceLogType> = DeviceActivityLog<T>['payload']
