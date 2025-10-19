import { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { View, Button, Platform } from 'react-native'
import { useSSO } from '@clerk/clerk-expo'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

const SignInWithOAuth = () => {
  useWarmUpBrowser()
  const { startSSOFlow } = useSSO()

  // biome-ignore lint/correctness/useExhaustiveDependencies: static callback
  const onPress = useCallback(async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ path: 'sso-callback' })
      console.log('Clerk auth flow, redirect URL:', redirectUrl)
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        // redirectUrl: Linking.createURL('/'),
        redirectUrl,
      })
      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        // Use signIn or signUp from startSSOFlow for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err)
    }
  }, [])

  return (
    <View style={{ padding: 16 }}>
      <Button title="Sign in with Google" onPress={onPress} />
    </View>
  )
}

export default SignInWithOAuth
