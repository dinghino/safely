import { DeviceProvider } from '@/features/device-manager'
import { GeolocationProvider } from '@/features/geolocation'
import { HeartbeatManager } from '@/features/heartbeat'
import { SessionManager } from '@/features/new-api/tracking-manager'

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
