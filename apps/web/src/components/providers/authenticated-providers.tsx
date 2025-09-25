import { DeviceProvider, SessionManager } from '@/features/new-api'
import { GeolocationProvider } from '@/features/geolocation'
import { HeartbeatManager } from '@/features/heartbeat/components/heartbeat'

export namespace AuthenticatedProviders {
  export type Props = { children: React.ReactNode }
}

/**
 * Provides additional providers and background services needed by the app to
 * let authenticated users and devices function properly.
 */
export const AuthenticatedProviders = (props: AuthenticatedProviders.Props) => {
  const { children } = props

  return (
    <DeviceProvider>
      <GeolocationProvider>
        <HeartbeatManager>
          <SessionManager />
          {children}
        </HeartbeatManager>
      </GeolocationProvider>
    </DeviceProvider>
  )
}
