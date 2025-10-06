import { useGeolocation } from '@/contexts/geolocation-context'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { View, Text, Button, Switch } from 'react-native'

import BackgroundGeolocation, { type Location } from 'react-native-background-geolocation'

export default function DemoPage() {
  return (
    <View style={{ gap: 8, flex: 1, padding: 8 }}>
      <Text>Demo Screen</Text>
      <Link href="/tabs/" asChild>
        <Button title="Go to Home Tab" />
      </Link>
      <Locator />
    </View>
  )
}

const Locator = () => {
  const { enabled, setEnabled, ready, location, getLocation } = useGeolocation()

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text>Toggle geolocation</Text>
        <Switch disabled={!ready} value={enabled} onValueChange={setEnabled} />
        <Button title="Get location" onPress={() => getLocation()} disabled={!ready} />
      </View>
      {location && <Text style={{fontFamily: 'monospace'}}>{JSON.stringify(location, null, 2)}</Text>}
      {!location && <Text>no location yet</Text>}
    </View>
  )
}
