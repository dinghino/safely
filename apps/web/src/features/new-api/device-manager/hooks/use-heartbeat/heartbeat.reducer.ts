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

type HeartbeatReducer = (state: HeartbeatState, action: HeartbeatAction) => HeartbeatState

export const heartbeatReducer: HeartbeatReducer = (state,{ type, payload }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[useHeartbeat reducer]', { type, payload })
  }
  switch (type) {
    case 'START_HEARTBEAT':
      console.log(`[useHeartbeat reducer] Starting heartbeat: ${state.intervalMs}ms`)
      return {
        ...state,
        state: 'STARTING',
        isRunning: true,
        intervalMs: payload.intervalMs,
        error: null,
      }
    case 'STOP_HEARTBEAT':
      console.log('[useHeartbeat reducer] Stopping heartbeat')
      return {
        ...state,
        state: 'IDLE',
        isRunning: false,
        error: null,
      }
    case 'HEARTBEAT_SENT':
      return {
        ...state,
        state: 'RUNNING',
        lastSentAt: Date.now(),
      }
    case 'SET_SESSION_TOKEN':
      console.log('[useHeartbeat reducer] Updating new session token')
      return {
        ...state,
        sessionToken: payload.token,
      }
    case 'REMOVE_SESSION_TOKEN':
      console.log('[useHeartbeat reducer] Removing session token')
      return {
        ...state,
        sessionToken: null,
      }
    case 'SET_ERROR':
      console.log('[useHeartbeat reducer] Setting heartbeat error:', payload.error)
      return {
        ...state,
        state: 'ERROR',
        error: payload.error,
      }
    case 'UPDATE_INTERVAL':
      console.log(`[useHeartbeat reducer] Updating heartbeat interval to: ${payload.intervalMs}ms`)
      return {
        ...state,
        intervalMs: payload.intervalMs,
      }
    default:
      console.warn(`[useHeartbeat reducer] Unhandled action type: ${type}`)
      return state
  }
}
