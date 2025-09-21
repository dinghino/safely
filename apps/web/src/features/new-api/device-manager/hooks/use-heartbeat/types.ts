import type { Device } from '@/entities/device/types'
export type { Device }

type HeartbeatAction =
  | { type: 'START_HEARTBEAT'; payload: { intervalMs: number } }
  | { type: 'STOP_HEARTBEAT'; payload?: never }
  | { type: 'HEARTBEAT_SENT'; payload?: never }
  | { type: 'SET_SESSION_TOKEN'; payload: { token: string | null } }
  | { type: 'REMOVE_SESSION_TOKEN'; payload?: never }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'UPDATE_INTERVAL'; payload: { intervalMs: number } }

export type HeartbeatStateName = 'IDLE' | 'STARTING' | 'RUNNING' | 'ERROR'

// Heartbeat state management with useReducer
export type HeartbeatState = {
  state: HeartbeatStateName
  sessionToken: string | null
  isRunning: boolean
  intervalMs: number
  lastSentAt: number | null
  error: string | null
}

export type HeartbeatReducer = (state: HeartbeatState, action: HeartbeatAction) => HeartbeatState
