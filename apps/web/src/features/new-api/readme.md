# New API Structure

This is the refactored version of the device tracking functionality, split from the original `derp.tsx` file into organized modules.

## Structure

- **location-manager/**: Handles geolocation API interactions and location state
- **device-manager/**: Manages device registration, heartbeat functionality, and device context
- **tracking-manager/**: Manages tracking sessions and location data collection

## Usage

```tsx
import { DemoProvider, useDeviceLocation, useDeviceContext, useSessionManager } from '@/features/new-api'

function App() {
  return (
    <DemoProvider>
      <YourComponents />
    </DemoProvider>
  )
}
```

## Migration from derp.tsx

- `DeviceLocationManager` → `DeviceLocationProvider` (location-manager)
- `DeviceContextProvider` → `DeviceProvider` (device-manager) 
- `SessionManagerProvider` → `SessionProvider` (tracking-manager)
- `FullProvider` → `DemoProvider`

## Notes

- All provider names were updated to avoid TypeScript namespace conflicts
- Each module has its own types, contexts, hooks, and components
- The code structure allows for future refactoring with useReducer
- Error handling and performance optimizations are planned for future iterations

This folder is a placeholder feature for testing new APIs through contexts
to handle device management, heartbeat and tracking sessions. all of these will
be later moved to their respective places in shared code, dedicated features or
directly into dedicated pacakges at the monorepo level.
