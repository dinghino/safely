'use client'

import { useReducer } from 'react'
import { heartbeatReducer } from './heartbeat.reducer'
import type { HeartbeatState } from './types'

export * from './types'

const initialState: HeartbeatState = {
  state: 'IDLE',
  enabled: true,
  sessionToken: null,
  isRunning: false,
  lastSentAt: null,
  error: null,
  intervalMs: 60_000,
}

export const useHeartbeatState = () => {
  return useReducer(heartbeatReducer, initialState)
}

export default useHeartbeatState
