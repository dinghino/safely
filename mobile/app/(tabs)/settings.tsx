import { useCallback, useMemo, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, View } from 'react-native'
import * as Haptics from 'expo-haptics'

import { SheetManager } from 'react-native-actions-sheet'
import BackgroundGeolocation from 'react-native-background-geolocation'

import { Text } from '@/components/ui/text'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useGeolocation } from '@/components/contexts/geolocation'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { CircleX, FootprintsIcon, MapPinPlusInside, SettingsIcon } from 'lucide-react-native'
import { useDeviceContext } from '@/components/contexts/device-manager'
import { DeviceStatusBadge } from '@/components/device-status-badge'
import { action } from '@/components/contexts/geolocation/geolocation.context'
import SessionButton from '@/components/session-requests'

import { transformGetLocationOptions } from '@/lib/geolocation'
import { WatchPositionButton } from '@/components/watch-position-toggle-button'

function useRequestPosition() {
  const { device } = useDeviceContext()
  const [loading, setLoading] = useState(false)
  const request = useCallback(async () => {
    setLoading(true)
    const options = transformGetLocationOptions(device?.settings, {})
    await BackgroundGeolocation.getCurrentPosition(options)
    setLoading(false)
  }, [device])

  return [request, loading] as const
}

export default function AppSettings() {
  const geo = useGeolocation()
  const { state, dispatch } = geo
  const { enabled, isMoving } = state

  const [requestPosition, requesting] = useRequestPosition()

  const togglePace = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const state = await BackgroundGeolocation.getState()
    const { enabled, isMoving } = state
    if (!enabled) return

    await BackgroundGeolocation.changePace(!isMoving)
    const payload = await BackgroundGeolocation.getState()
    dispatch(action.event({ name: '🚶‍♂️ toggle pace', data: { isMoving: payload.isMoving } }))
    dispatch(action.update(payload))
  }, [dispatch])

  return (
    <View className="flex-1 justify-stretch gap-4">
      {/* <SafeAreaView className='bg-red-500 gap-4 px-4'> */}
      <StatusBar style="auto" translucent />
      <Stack.Screen options={{ title: 'Settings' }} />
      {/* toolbar */}
      <View className="flex-col gap-2 px-4 pt-4">
        <View className="flex-row justify-stretch gap-2">
          <SessionButton />
          <Button variant="secondary" size="icon" onPress={requestPosition} disabled={requesting}>
            <Icon as={MapPinPlusInside} />
            {/* <Text>Get Position</Text> */}
          </Button>
          <WatchPositionButton />
          <View className="flex-1" />
          <Button disabled={!enabled} size="icon" variant="outline" onPress={togglePace}>
            {isMoving ? <Icon as={CircleX} /> : <Icon as={FootprintsIcon} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onPress={() => SheetManager.show('device-settings')}
          >
            <Icon as={SettingsIcon} />
            {/* <Text>Open Device Settings</Text> */}
          </Button>
        </View>
        <View className="flex-row gap-2">
          {!!geo.listeners?.count && (
            <Button size="sm" className="flex-1" onPress={geo.listeners?.cleanup}>
              <Text>Cleanup {geo.listeners?.count} Listeners</Text>
            </Button>
          )}
          {!geo.listeners?.count && (
            <Button size="sm" className="flex-1" onPress={geo.listeners?.setup}>
              <Text>Setup Listeners</Text>
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onPress={() => SheetManager.show('debug-locations-data')}
          >
            <Text>Locations</Text>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => SheetManager.show('debug-geo-events')}
          >
            <Text>Events</Text>
          </Button>
        </View>
        {/* <View className="flex-row gap-2"></View> */}
      </View>

      <ScrollView contentContainerClassName="gap-4 px-4">
        <View className="aspect-square flex-1 items-center justify-center rounded-lg bg-muted">
          <Text>map goes here</Text>
        </View>
        <GeolocationState />
      </ScrollView>

      <StatusBadges className="flex-row items-center justify-center border-t border-t-muted px-4 py-2" />
      {/* </SafeAreaView> */}
    </View>
  )
}

const StatusBadges = ({ className }: { className: string }) => {
  const { device } = useDeviceContext()
  const { state } = useGeolocation()

  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {device ? (
        <>
          <DeviceStatusBadge device={device} />
          <Badge>
            <Text>Mode</Text>
            <Text>{device.mode}</Text>
          </Badge>
          <Badge>
            <Text>Heartbeat</Text>
            <Text>{device.settings.heartbeat.interval / 1000}s</Text>
          </Badge>
        </>
      ) : (
        <Badge variant="destructive">
          <Text>Device data unavailable</Text>
        </Badge>
      )}
      <Badge>
        <Text>BGL Heartbeat</Text>
        <Text>{state.heartbeatInterval}s</Text>
      </Badge>
    </View>
  )
}

function GeolocationState() {
  const { state } = useGeolocation()
  const { device } = useDeviceContext()

  const data = useMemo(() => flatten(state), [state])
  const info = useMemo(() => {
    if (!device) return []
    return flatten(device)
  }, [device])

  return (
    <View className="gap-2 rounded-md bg-muted p-2">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="default" className="w-full">
            <Text className="sticky top-0"> Current states</Text>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
          <Text className="mb-2 ml-4 font-bold text-lg">Geolocation state</Text>
          <ScrollView horizontal>
            <View className="min-w-fit">
              {data.map(([key, value]) => (
                <View key={key} className="flex-row items-center justify-start gap-2">
                  <Text className="font-medium text-sm">{key}</Text>
                  <Text className="text-start text-xs">{JSON.stringify(value, null, 2)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {device && (
            <>
              <View className="my-2 border-foreground/10 border-t" />
              <Text className="mb-2 ml-4 font-bold text-lg">Device info</Text>
              <ScrollView horizontal>
                <View className="w-full min-w-fit">
                  {info.map(([key, value]) => (
                    <View key={key} className="flex-row justify-start gap-2">
                      <Text className="font-medium text-sm">{key}</Text>
                      <Text className="text-xs">{JSON.stringify(value, null, 2)}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </View>
  )
}

/**
 * recursive function to flatten an object in [key, value] pairs
 */
function flatten(obj: Record<string, any>, prefix = ''): [string, any][] {
  const result: [string, any][] = []
  for (const [key, value] of Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0]))) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      result.push(...flatten(value, newKey))
    } else {
      result.push([newKey, value])
    }
  }
  return result
}
