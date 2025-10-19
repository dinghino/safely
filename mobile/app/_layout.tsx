import '@/global.css'

import * as React from 'react'

import { ClerkLoaded, ClerkLoading, ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'

import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'

import { PortalHost } from '@rn-primitives/portal'
import { ThemeProvider } from '@react-navigation/native'

import { useColorScheme } from 'nativewind'
import { NAV_THEME } from '@/lib/theme'
import { AppHeader } from '@/components/app-header'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
})

export default function RootLayout() {
  const { colorScheme } = useColorScheme()

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar animated style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Routes />
            <PortalHost />
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
      <ClerkLoading>
        <StatusBar animated style={colorScheme === 'dark' ? 'light' : 'dark'} />
        {/* loading / splash / something */}
      </ClerkLoading>
    </ClerkProvider>
  )
}

SplashScreen.preventAutoHideAsync()

function Routes() {
  const { isSignedIn, isLoaded } = useAuth()

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync().catch((e) => {
        // Ignore keep awake errors during development
        console.warn('Failed to hide splash screen:', e)
      })
    }
  }, [isLoaded])

  if (!isLoaded) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        header: () => <AppHeader />,
        // headerShown: true,
      }}>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isSignedIn}>
        {/* <Stack.Screen name="index" /> */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}
    </Stack>
  )
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
}

const SIGN_UP_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
}
