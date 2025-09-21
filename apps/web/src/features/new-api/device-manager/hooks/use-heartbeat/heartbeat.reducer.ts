import type { HeartbeatReducer } from './types'

export const heartbeatReducer: HeartbeatReducer = (state, { type, payload }) => {

  log('[useHeartbeat reducer]', { type, payload })

  switch (type) {
    case 'START_HEARTBEAT':
      log(`[useHeartbeat reducer] [${type}] Starting heartbeat: ${state.intervalMs}ms`)
      return {
        ...state,
        state: 'STARTING',
        isRunning: true,
        intervalMs: payload.intervalMs,
        error: null,
      }
    case 'STOP_HEARTBEAT':
      log(`[useHeartbeat reducer] [${type}] Stopping heartbeat`)
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
      log(`[useHeartbeat reducer] [${type}] Updating new session token`)
      return {
        ...state,
        sessionToken: payload.token,
      }
    case 'REMOVE_SESSION_TOKEN':
      log(`[useHeartbeat reducer] [${type}] Removing session token`)
      return {
        ...state,
        sessionToken: null,
      }
    case 'SET_ERROR':
      log(`[useHeartbeat reducer] [${type}] Setting heartbeat error:`, payload.error)
      return {
        ...state,
        state: 'ERROR',
        error: payload.error,
      }
    case 'UPDATE_INTERVAL':
      log(`[useHeartbeat reducer] [${type}] Updating heartbeat interval to: ${payload.intervalMs}ms`)
      return {
        ...state,
        intervalMs: payload.intervalMs,
      }
    default:
      log(`[useHeartbeat reducer] [${type}] 🐛 Unhandled action type`)
      return state
  }
}

function log(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}
