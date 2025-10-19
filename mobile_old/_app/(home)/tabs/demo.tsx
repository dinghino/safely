import { useGeolocation } from '@/contexts/geolocation-context'
import { Link } from 'expo-router'
import { View, Text, Button, Switch, ScrollView, StyleSheet } from 'react-native'
// import BackgroundGeolocation from 'react-native-background-geolocation'
import { setupHttp, disableHttp } from '@/lib/geolocation.setup'
import { useDeviceContext } from '@/contexts/device-manager'

export default function DemoPage() {
  return (
    <View style={{ gap: 8, flex: 1, padding: 8 }}>
      <Locator />
    </View>
  )
}

const Locator = () => {
  const geo = useGeolocation()
  const { device } = useDeviceContext()
  // const { enabled, changeConfig, ready, location, state, getLocation } =
  //   useGeolocation()
  const { ready, state, enabled } = geo

  const toggleDebug = async () => geo.changeConfig({ debug: !state?.debug })
  const toggleEnabled = async () => (enabled ? geo.stop() : geo.start())

  const handleEnableHttp = () => {
    if (!device) return
    setupHttp({
      deviceId: device._id,
      // sessionToken: device.sessionToken, // comes from heartbeat response
    })
  }

  return (
    <>
      {/* <View> */}
      <View style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <Toggle label="Enabled" value={enabled} onValueChange={toggleEnabled} />
        <Toggle label="Debug sounds" value={state?.debug || false} onValueChange={toggleDebug} />
      </View>
      <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
        {!geo.events?.length && (
          <View style={{ ...styles.codeWrapper, backgroundColor: '#ddd' }}>
            <Text>No events yet</Text>
          </View>
        )}
        {geo.events?.map((event, index) => (
          <View
            key={`${event.name}-${index}`}
            style={{ ...styles.codeWrapper, backgroundColor: '#ddd', marginBottom: 4 }}
          >
            <Text style={styles.code}>
              {event.name} @ {event.timestamp}
              {/* {JSON.stringify(event, null, 2)} */}
            </Text>
          </View>
        ))}
        <View style={styles.codeWrapper}>
          {geo.location && <Text style={styles.code}>{JSON.stringify(geo.location, null, 2)}</Text>}
          {!geo.location && <Text>no location yet</Text>}
        </View>
        <View style={styles.codeWrapper}>
          {state && <Text style={styles.code}>{JSON.stringify(state, null, 2)}</Text>}
        </View>
      </ScrollView>

      <ButtonRow>
        <View style={{ flex: 1 }}>
          <Button title="Get location" onPress={() => geo.getLocation()} disabled={!ready} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Dispatch" onPress={() => {}} disabled={!ready} />
        </View>
      </ButtonRow>
      <ButtonRow>
        <View style={{ flex: 1 }}>
          <Button title="Enable HTTP" onPress={handleEnableHttp} disabled={!device} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Disable HTTP" onPress={disableHttp} />
        </View>
      </ButtonRow>

      {/* </View> */}
    </>
  )
}

function ButtonRow({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        // marginBottom: 16,
      }}
    >
      {children}
    </View>
  )
}

function Toggle({
  value,
  onValueChange,
  label,
}: {
  value: boolean
  onValueChange: (newValue: boolean) => void
  label: string
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={{ fontSize: 20 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    gap: 8,
    paddingBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  separator: { height: 1, backgroundColor: '#ccc', marginVertical: 8 },
  codeWrapper: {
    backgroundColor: '#ababab',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
})
