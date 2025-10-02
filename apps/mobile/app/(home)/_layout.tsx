import { SignOutButton } from '@/components/sign-out-button'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { Button } from 'react-native'

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2a2a2a' },
        contentStyle: { backgroundColor: '#efefef' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home', headerRight: () => <HeaderRight /> }} />
      <Stack.Screen name="tabs" options={{ headerTitle: 'Tabs' }} />
    </Stack>
  )
}

function HeaderRight() {
  return (
    <>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Link href="/sign-in" asChild>
          <Button title="Sign in" />
        </Link>
      </SignedOut>
    </>
  )
}
