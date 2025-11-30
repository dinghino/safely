import type { DeviceLogType, DeviceLogData, DeviceLogEntry } from '../types'

export function _isLogType<T extends DeviceLogType>(
  type: T,
  log: DeviceLogData,
): log is Extract<DeviceLogData, { type: T }> {
  return log.type === type
}

export function _isLogEntryType<T extends DeviceLogType>(
  type: T,
  logEntry: DeviceLogEntry,
): logEntry is Extract<DeviceLogEntry, { type: T }> {
  return logEntry.type === type
}
