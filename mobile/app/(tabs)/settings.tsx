import { useCallback, useMemo } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, View } from 'react-native'
import * as Haptics from 'expo-haptics'

import { SheetManager } from 'react-native-actions-sheet'
import BackgroundGeolocation from 'react-native-background-geolocation'

import { Text } from '@/components/ui/text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { type Geolocation, type Location, useGeolocation } from '@/components/contexts/geolocation'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import {
  BellMinusIcon,
  CircleX,
  FootprintsIcon,
  MapPinMinus,
  SettingsIcon,
} from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import { useDeviceContext } from '@/components/contexts/device-manager'
import { DeviceStatusBadge } from '@/components/device-status-badge'
import { action } from '@/components/contexts/geolocation/geolocation.context'
import SessionButton from '@/components/session-requests'

export default function AppSettings() {
  const geo = useGeolocation()
  const { state, dispatch, events, locations } = geo
  const { enabled, isMoving } = state

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

  const [lastEvents, restEvents] = useMemo(() => {
    const reversed = events.toReversed()
    if (events.length <= 5) return [reversed, []]
    // split into last 5 and the rest
    return [reversed.slice(0, 5), reversed.slice(5)]
  }, [events])

  return (
    <View className="flex-1 gap-4">
      {/* <SafeAreaView className='bg-red-500 gap-4 px-4'> */}
      <StatusBar style="auto" translucent />
      <Stack.Screen options={{ title: 'Settings' }} />

      <View className="flex-col gap-2 px-4 pt-4">
        <View className="flex-row justify-stretch gap-2">
          <SessionButton />
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
      </View>

      <ScrollView className="min-h-48" contentContainerClassName="gap-4 px-4">
        <GeolocationState />
        <Collapsible>
          <View className="gap-2 rounded-md bg-muted p-2">
            <View className="flex-row items-center justify-between gap-4 pl-2">
              <Text className="font-bold text-lg">Events</Text>
              <View className="flex-row items-center gap-2">
                {restEvents.length && (
                  <CollapsibleTrigger asChild>
                    <Button variant="outline">
                      <Text>{restEvents.length} more events</Text>
                    </Button>
                  </CollapsibleTrigger>
                )}
                <Button
                  disabled={!events.length}
                  size="icon"
                  variant="destructive"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                    geo.clearEvents()
                  }}
                >
                  <Icon as={BellMinusIcon} className="size-4" />
                </Button>
              </View>
            </View>
            {!events.length && (
              <Text className="pl-4 text-start text-foreground/75 text-lg">
                No events received yet.
              </Text>
            )}
            {lastEvents.map((event, i) => (
              <EventCard key={`${event.timestamp}--${i}`} event={event} />
            ))}
            {restEvents.length > 0 && (
              <CollapsibleContent className="gap-2">
                {restEvents.map((event, i) => (
                  <EventCard key={`${event.timestamp}--${i}`} event={event} />
                ))}
              </CollapsibleContent>
            )}
          </View>
        </Collapsible>

        <View className="gap-2 rounded-md bg-muted p-2">
          <View className="flex-row items-center justify-between pl-2">
            <Text className="font-bold text-lg">Locations</Text>
            <Button
              disabled={!locations.length}
              size="icon"
              variant="destructive"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                geo.clearLocations()
              }}
            >
              <Icon as={MapPinMinus} className="size-4" />
            </Button>
          </View>
          {!locations.length && (
            <Text className="pl-4 text-start text-foreground/75 text-lg">
              No locations recorded yet.
            </Text>
          )}
          {locations.reverse().map((location, i) => (
            <LocationCard key={`${location.timestamp}--${i}`} location={location} />
          ))}
        </View>
      </ScrollView>

      <StatusBadges className="flex-row items-center justify-center border-t border-t-muted px-4 py-2" />
      {/* </SafeAreaView> */}
    </View>
  )
}

const Trigger = ({ children, ...props }: { children: React.ReactNode }) => {
  const { colorScheme } = useColorScheme()

  return (
    <Button
      variant={colorScheme === 'dark' ? 'default' : 'default'}
      className="justify-start gap-2"
      {...props}
    >
      {children}
    </Button>
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

function EventCard({ event }: { event: Geolocation.Event }) {
  return (
    <Collapsible className="gap-2">
      <CollapsibleTrigger asChild>
        <Trigger>
          <View className="flex flex-row justify-between gap-4">
            <Text className="flex-1">{event.name}</Text>
            <Text className="text-muted-foreground">{formatTimestamp(event.timestamp)}</Text>
          </View>
        </Trigger>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="py-4">
          <CardContent className="px-4">
            <Text className="text-xs">{JSON.stringify(event.data, null, 2)}</Text>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}

function LocationCard({ location }: { location: Location }) {
  return (
    <Collapsible className="gap-2">
      <CollapsibleTrigger asChild>
        <Trigger>
          <Text>{new Date(location.timestamp).toLocaleString()}</Text>
        </Trigger>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card key={location.timestamp} className="py-2">
          <CardHeader>
            <CardTitle>
              {location.coords.latitude}, {location.coords.longitude}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-xs">{JSON.stringify(location, null, 2)}</Text>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
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

// format timestamp in HH:MM:SS.mmmm with damn milliseconds
function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}
