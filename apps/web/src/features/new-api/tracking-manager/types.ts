import type { Doc } from '@workspace/backend/dataModel'

export type ActiveSession = Doc<'trackSession'>

export interface SessionState {
  activeSession: ActiveSession | null
  isTracking: boolean
  error: string | null
}

export interface SessionManagerContextValue extends SessionState {
  startSession: () => void
  stopSession: () => void
}

export namespace SessionManagerProvider {
  export type Value = SessionManagerContextValue
  export type Props = {
    children: React.ReactNode
  }
}
