import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const RootLayout: React.FC = () => {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <StatusBar style='inverted' />
      <Slot />
    </ClerkProvider>
  )
}

export default RootLayout
