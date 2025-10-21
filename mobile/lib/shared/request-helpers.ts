import type { FunctionReturnType } from 'convex/server'
import type { Device } from '@workspace/backend/types'
import type { api } from '@workspace/backend/api'

export type TrackingRequest = NonNullable<FunctionReturnType<typeof api.tracking.requests.getOpen>>

export type ValidationOptions = {
  request: TrackingRequest
  device: Device
}

export function isFromThisDevice(data: ValidationOptions) {
  const { request, device } = data
  return request.target === device._id && request.sender === device._id
}

export function isFromCurrentUser(data: ValidationOptions) {
  const { request, device } = data
  return request.owner === device.owner
}

export function isRequestValid(data: ValidationOptions) {
  // request must be either from this device or from the current user
  return isFromThisDevice(data) || isFromCurrentUser(data)
}
