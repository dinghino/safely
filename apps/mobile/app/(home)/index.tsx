import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Button, Text, View } from 'react-native'
import { SignOutButton } from '@/components/sign-out-button'

export default function Page() {
  const { user } = useUser()

  return (
    <View>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0]?.emailAddress}</Text>
        <View style={{ padding: 16}}>
          <SignOutButton />
        </View>
      </SignedIn>
      <SignedOut>
        <View style={{ gap: 16, padding: 16 }}>
          <Link href="/(auth)/sign-in" asChild>
            <Button onPress={() => {}} title="Sign in" />
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <Button onPress={() => {}} title="Sign up" />
          </Link>
        </View>
      </SignedOut>
    </View>
  )
}
