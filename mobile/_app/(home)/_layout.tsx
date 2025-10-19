import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { Stack } from 'expo-router/stack'

import { DeviceManager } from '@/contexts/device-manager'
import GeolocationContext from '@/contexts/geolocation-context'

// import { HeartbeatManager } from '@/components/heartbeat'

import { SignOutButton } from '@/components/sign-out-button'

export default function Layout() {
  return (
    <DeviceManager>
      <GeolocationContext>
        {/* <HeartbeatManager /> */}
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#2a2a2a' },
            contentStyle: { backgroundColor: '#efefef' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () => <HeaderRight />,
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="tabs" options={{ headerTitle: 'Tabs' }} singular />
        </Stack>
      </GeolocationContext>
    </DeviceManager>
  )
}

function HeaderRight() {
  return (
    <>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Redirect href="/sign-in" />
        {/* <Link href="/sign-in" asChild>
          <Button title="Sign in" />
        </Link> */}
      </SignedOut>
    </>
  )
}
