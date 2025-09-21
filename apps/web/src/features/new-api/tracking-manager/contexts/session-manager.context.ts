import { createContext } from '@workspace/react-utils'
import type { SessionManagerContextValue } from '../types'

export const [SessionManagerContext, useSessionManager] =
  createContext<SessionManagerContextValue>('SessionManagerContext')
