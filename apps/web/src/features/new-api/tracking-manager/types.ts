import type { Doc } from '@workspace/backend/dataModel'

export type ActiveSession = Doc<'trackSession'>

export interface SessionState {
  activeSession: ActiveSession | null
  isTracking: boolean
  error: string | null
}

export interface SessionManagerContextValue extends SessionState {
  startTracking: () => void
  stopTracking: () => void
}

export namespace SessionManagerProvider {
  export type Props = {
    children: React.ReactNode
  }
}
