import { useAuth } from '@clerk/clerk-expo'
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
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <StatusBar style="inverted" />
        <Slot />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

export default RootLayout
