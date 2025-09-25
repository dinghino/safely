import { DeviceProvider, SessionManager } from '@/features/new-api'
import { GeolocationProvider } from '@/features/geolocation'

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
        <SessionManager />
        {children}
      </GeolocationProvider>
    </DeviceProvider>
  )
}
