import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { Button, StyleSheet, Text, View } from 'react-native'
import { SignOutButton } from '@/components/sign-out-button'

export default function Page() {
  const { user } = useUser()

  const displayName = user?.username ?? user?.emailAddresses[0]?.emailAddress

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.name}>Hello, {displayName}</Text>
        <SignOutButton />
        <Button title="Go to tabs" onPress={() => router.push('/tabs')} />
      </SignedIn>
      <SignedOut>
        <Link href="/sign-in" asChild>
          <Button title="Sign in" />
        </Link>
        <Link href="/sign-up" asChild>
          <Button title="Sign up" />
        </Link>
      </SignedOut>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})
