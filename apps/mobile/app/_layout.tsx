import { ClerkLoaded, ClerkLoading, useAuth } from '@clerk/clerk-expo'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'

import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
})

const RootLayout: React.FC = () => {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <StatusBar style="inverted" />
          <Slot />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
      <ClerkLoading>
        <StatusBar style="inverted" />
        {/*
        until clerk is loaded we can't mount the app since we get the user
        first thing inside our contexts and it throws if clerk isn't ready
        */}
        {/* todo: render a loading screen here */}
      </ClerkLoading>
    </ClerkProvider>
  )
}

export default RootLayout
