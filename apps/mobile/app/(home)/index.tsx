import { Link, router } from 'expo-router'
import { useQuery } from 'convex/react'
import { Button, StyleSheet, Text, View, Alert } from 'react-native'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'

import { api } from '@workspace/backend/api'

import { useDeviceContext } from '@/contexts/device-manager'

import { SignOutButton } from '@/components/sign-out-button'
import { ServerHealthcheck } from '@/components/healtcheck'

export default function Page() {
  const { user } = useUser()
  const data = useQuery(api.users.current)
  const displayName = user?.username ?? user?.emailAddresses[0]?.emailAddress

  const manager = useDeviceContext()

  return (
    <View style={styles.container}>
      <SignedIn>
        <ServerHealthcheck />
        <Text style={styles.name}>Hello, {displayName}</Text>
        {data && <Text style={styles.id}>{data._id}</Text>}
        <SignOutButton />
        <Button onPress={() => Alert.alert('This is the home screen of the app.', 'Bob Ross')} title="Info" />
        <Button
          title="Register Device"
          disabled={manager.isRegistered}
          onPress={manager.registerDevice}
        />
        <Text>Device ID: {manager.deviceId ?? 'no id'}</Text>
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
    justifyContent: 'flex-start',
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  id: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#2a2a2a',
    paddingInline: 4,
    paddingBlock: 2,
    borderRadius: 4,
    borderColor: '#000',
    borderWidth: 1,
  },
})
