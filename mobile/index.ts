/**
 * Custom entry point for mobile app so that we can register
 * headless background tasks and any other global setup before the app loads.
 * @see {@link https://docs.expo.dev/router/installation/#custom-entry-point-to-initialize-and-load}
 * @see {@link https://github.com/transistorsoft/react-native-background-geolocation/wiki/Android-Headless-Mode}
 */

// Import side effects first and services
import BackgroundGeolocation from 'react-native-background-geolocation'
import type { Location, HeadlessEvent } from 'react-native-background-geolocation'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@workspace/backend/api'

import type { Device } from '@workspace/backend/types'
import store from '@/lib/secure-store'
import { STORE_KEY } from './constants'
import * as helpers from '@/lib/geolocation'

// temporary flag to disable headless heartbeat until we figure out auth issues
const ENABLED = false

// import * as dotenv from 'dotenv'
// dotenv.config({ path: '.env' })
async function createConvexClient() {
  // FIXME: dotenv not working with expo - need to get the env var from process.env directly
  const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? 'https://cool-eagle-370.convex.cloud'
  if (!CONVEX_URL) {
    throw new Error('CONVEX_URL is not defined in environment variables')
  }
  const jwt = await store.load<string>({ key: STORE_KEY.CLERK_JWT })

  return new ConvexHttpClient(CONVEX_URL, {
    auth: jwt,
    logger: true,
  })
}

// during a heartbeat event we dispatch a new request for the current position
async function handleHeartbeat(device: Device | undefined) {
  const options = helpers.transformGetLocationOptions(device, {
    samples: 3,
    extras: { headless: true },
  })
  await BackgroundGeolocation.getCurrentPosition(options)
}

let sendingHeartbeat = false
async function handleLocationEvent(opts: { device: Device; location: Location }) {
  const { device, location } = opts

  if (!ENABLED)
    return console.log('😶‍🌫️ 💓 Headless heartbeat disabled, skipping location event handling')

  if (location.sample) return console.log('😶‍🌫️ 📍 Ignoring sample location event')

  if (sendingHeartbeat)
    return console.log('😶‍🌫️ 💓 Already sending heartbeat, skipping location event handling')

  console.log('😶‍🌫️ 📍 Handling headless location event')
  sendingHeartbeat = true

  try {
    console.log('😶‍🌫️ 💓 Sending heartbeat with location')
    const client = await createConvexClient()
    // todo: store session token for when we're back in the foreground?
    const { sessionToken } = await client.mutation(api.devices.heartbeat.send, {
      deviceId: device._id,
      interval: device.settings.heartbeat.interval,
      location: helpers.transformLocation(location),
    })
    await store.save(STORE_KEY.DEVICE_SESSION_TOKEN, sessionToken)
    console.log('😶‍🌫️ 💓 Heartbeat sent successfully')
  } catch (error) {
    console.error('😶🤬 💓 Error sending heartbeat:', error)
  } finally {
    sendingHeartbeat = false
  }
}

/**
 * Entry point for background geolocation headless task. this is called when the
 * app is terminated/killed but the background geolocation service is running,
 * receiving ANY event from the plugin.
 * This is short lived and needs to complete all its tasks that NEED to be awaited,
 * as the OS will kill the process when running the last line.
 */
const HeadlessTask = async (event: HeadlessEvent) => {
  // stored by device manager whenever the device data changes
  // if the device is not present we can bail out of processing anything since
  // we can't tell the server who we are.
  // we should also keep this in sync from headless so that settings changes
  // are respected even when the app is not running.
  const device = await store.load<Device>({ key: STORE_KEY.DEVICE, parser: JSON.parse })

  if (!device) {
    console.log('😶‍🌫️ No device found in secure store, skipping HeadlessTask processing')
    return
  }

  switch (event.name) {
    case 'heartbeat': {
      console.log('😶‍🌫️ 💓 [heartbeat]', { device })
      await handleHeartbeat(device)
      return
    }
    case 'location': {
      const location = event.params as unknown as Location
      const data = { device, location }
      console.log('😶‍🌫️ 📍 [location]', data)
      await handleLocationEvent(data)
      return
    }
    // Handle other headless events if needed
    default:
      console.log(`😶‍🌫️ [${event.name}]`, event.params)
    // console.log(`😶‍🌫️ [${event.name}] -`, event.params)
  }
}

////
// Register your HeadlessTask with BackgroundGeolocation plugin.
//
console.log('🚀 Registering BackgroundGeolocation HeadlessTask')
BackgroundGeolocation.registerHeadlessTask(HeadlessTask)
// Initialize services

// Register app entry through Expo Router as if we were using package.json "main" field
import 'expo-router/entry'
