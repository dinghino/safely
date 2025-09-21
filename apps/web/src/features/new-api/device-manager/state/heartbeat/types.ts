import type { Device } from '@/entities/device/types'
export type { Device }

export type HeartbeatAction =
  | { type: 'START_HEARTBEAT'; payload: { intervalMs: number } }
  | { type: 'STOP_HEARTBEAT'; payload?: never }
  | { type: 'SENDING_HEARTBEAT'; payload?: never }
  | { type: 'HEARTBEAT_SENT'; payload?: never }
  | { type: 'SET_SESSION_TOKEN'; payload: { token: string | null } }
  | { type: 'REMOVE_SESSION_TOKEN'; payload?: never }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'UPDATE_INTERVAL'; payload: { intervalMs: number } }

export type HeartbeatStateName = 'IDLE' | 'STARTING' | 'SENDING' | 'RUNNING' | 'ERROR'
export type HeartbeatActionType = HeartbeatAction['type']

// Heartbeat state management with useReducer
export type HeartbeatState = {
  /** current state */
  state: HeartbeatStateName
  /** whether the heartbeat is enabled */
  enabled: boolean
  /** current ephemeral session token from the server */
  sessionToken: string | null
  /** whether the heartbeat is currently running */
  isRunning: boolean
  /** interval between heartbeats */
  intervalMs: number
  /** timestamp of the last successful heartbeat */
  lastSentAt: number | null
  /** last error message, if any */
  error: string | null
}

export type HeartbeatReducer = (state: HeartbeatState, action: HeartbeatAction) => HeartbeatState
