/**
 * Custom entry point for mobile app so that we can register
 * headless background tasks and any other global setup before the app loads.
 * @see {@link https://docs.expo.dev/router/installation/#custom-entry-point-to-initialize-and-load}
 */

// Import side effects first and services

// Import BackgroundGeolocation
import BackgroundGeolocation, { type HeadlessEvent } from 'react-native-background-geolocation'

const HeadlessTask = async (event: HeadlessEvent) => {
  const params = event.params
  switch (event.name) {
    case 'heartbeat':
      console.log('😶‍🌫️ 💓 [heartbeat]', event)
      break
    // Handle other headless events if needed
    default:
      console.log(`😶‍🌫️ [${event.name}] -`, params)
  }
  return Promise.resolve()
}

////
// Register your HeadlessTask with BackgroundGeolocation plugin.
//
console.log('🚀 Registering BackgroundGeolocation HeadlessTask')
BackgroundGeolocation.registerHeadlessTask(HeadlessTask)
// Initialize services

// Register app entry through Expo Router
import 'expo-router/entry'
