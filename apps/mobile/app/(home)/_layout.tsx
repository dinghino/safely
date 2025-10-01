import { SignOutButton } from '@/components/sign-out-button'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Stack } from 'expo-router/stack'
import { Button } from 'react-native'

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2a2a2a',
        },
        contentStyle: {
          backgroundColor: '#efefef',
          padding: 16,
        },
        
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => <HeaderRight />
        }}
      />
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
        <Link href="/(auth)/sign-in" asChild>
          <Button title="Sign in" />
        </Link>
      </SignedOut>
    </>
  )
}
