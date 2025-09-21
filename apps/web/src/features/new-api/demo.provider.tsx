import { DeviceLocationProvider } from './location-manager'
import { DeviceProvider } from './device-manager'
import { SessionProvider } from './tracking-manager'

// @copilot: This is the composed provider that wraps all the individual modules
// todo: Consider adding error boundaries for each provider level
interface DemoProviderProps {
  children: React.ReactNode
}

/**
 * Demo provider that composes all the new API providers in the correct order.
 * This replaces the FullProvider from derp.tsx and demonstrates the new modular structure.
 * 
 * Provider hierarchy:
 * 1. DeviceLocationProvider - Manages geolocation API and location state
 * 2. DeviceProvider - Manages device registration and heartbeat functionality  
 * 3. SessionProvider - Manages tracking sessions and location data collection
 */
const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  return (
    <DeviceLocationProvider>
      <DeviceProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </DeviceProvider>
    </DeviceLocationProvider>
  )
}

export default DemoProvider
