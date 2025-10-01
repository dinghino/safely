import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Button, Text, View } from 'react-native'
import { SignOutButton } from '@/components/sign-out-button'

export default function Page() {
  const { user } = useUser()

  const displayName = user?.username ?? user?.emailAddresses[0]?.emailAddress

  return (
    <View style={{ gap: 16, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <SignedIn>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Hello, {displayName}
        </Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in" asChild>
          <Button title="Sign in" />
        </Link>
        <Link href="/(auth)/sign-up" asChild>
          <Button title="Sign up" />
        </Link>
      </SignedOut>
    </View>
  )
}
