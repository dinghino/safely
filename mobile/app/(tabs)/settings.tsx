import { useCallback, useId, useMemo } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, View } from 'react-native'
import * as Haptics from 'expo-haptics'

import BackgroundGeolocation from 'react-native-background-geolocation'

import { Text } from '@/components/ui/text'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { type Geolocation, type Location, useGeolocation } from '@/components/contexts/geolocation'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { BellMinusIcon, CircleX, CodeIcon, FootprintsIcon, MapPinMinus } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import { useDeviceContext } from '@/components/contexts/device-manager'
import { DeviceStatusBadge } from '@/components/device-status-badge'
import { action } from '@/components/contexts/geolocation/geolocation.context'

export default function AppSettings() {
  const geo = useGeolocation()
  const { state, dispatch, events, locations } = geo
  const { enabled, debug, isMoving } = state

  const start = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    BackgroundGeolocation.start().then((state) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      dispatch(action.update({ enabled: state.enabled }))
    })
  }, [dispatch])

  const stop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    BackgroundGeolocation.stop().then((state) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      dispatch(action.update({ enabled: state.enabled }))
    })
  }, [dispatch])

  const togglePace = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    BackgroundGeolocation.getState().then(({ isMoving, enabled }) => {
      if (!enabled) return
      BackgroundGeolocation.changePace(!isMoving, async () => {
        const payload = await BackgroundGeolocation.getState()
        dispatch(action.event({ name: '🚶‍♂️ toggle pace', data: { isMoving: payload.isMoving } }))
        dispatch(action.update(payload))
      })
    })
  }, [dispatch])

  // const toggleLocator = useCallback(() => {
  //   const method = enabled ? BackgroundGeolocation.stop : BackgroundGeolocation.start
  //   method((state) => {
  //     dispatch({ type: 'update', payload: { enabled: !state.enabled } })
  //   })
  // }, [enabled, dispatch])

  const toggleDebug = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    BackgroundGeolocation.setConfig({ debug: !debug }).then(({ debug }) =>
      dispatch(action.update({ debug })),
    )
  }, [debug, dispatch])

  const [lastEvents, restEvents] = useMemo(() => {
    const reversed = events.toReversed()
    if (events.length <= 5) return [reversed, []]
    // split into last 5 and the rest
    return [reversed.slice(0, 5), reversed.slice(5)]
  }, [events])

  return (
    <>
      {/* <SafeAreaView> */}
      <StatusBar style="auto" translucent />
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="px-4 py-2">
        <StatusBadges />
      </View>
      <View className="gap-2 px-4">
        {/* <Text className="mb-4 font-bold text-xl">Geolocation debugging</Text> */}
        <View className="flex-row justify-stretch gap-2">
          {enabled ? (
            <Control className="flex-1" variant="destructive" label="Stop" action={stop} />
          ) : (
            <Control className="flex-1" variant="default" label="Start" action={start} />
          )}

          <Control
            className="flex-1"
            label={
              <>
                <Icon as={CodeIcon} />
                <Text>{debug ? 'Disable' : 'Enable'}</Text>
              </>
            }
            active={!!debug}
            variant="secondary"
            action={toggleDebug}
          />
          <Button disabled={!enabled} size="icon" variant="secondary" onPress={togglePace}>
            {isMoving ? <Icon as={CircleX} /> : <Icon as={FootprintsIcon} />}
          </Button>
        </View>
      </View>

      <ScrollView className="m-4 min-h-48" contentContainerClassName="gap-4">
        <GeolocationState />
        <Collapsible>
          <View className="gap-2 rounded-md bg-gray-100 p-2 dark:bg-neutral-900">
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

        <View className="gap-2 rounded-md bg-gray-100 p-2 dark:bg-neutral-900">
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
      {/* </SafeAreaView> */}
    </>
  )
}

// { state, locations, events, dispatch, clearLocations, clearEvents }
type ControlProps = {
  active?: boolean
  action: () => void
  label: string | React.ReactNode
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
}
function Control(props: ControlProps) {
  const { active, action, label, className, variant } = props
  const id = useId()

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action()
  }

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Button
        className="w-full"
        variant={variant ?? (active ? 'destructive' : 'default')}
        onPress={onPress}
        id={id}
      >
        {typeof label === 'string' ? <Text>{label}</Text> : label}
      </Button>
    </View>
  )
}

const Trigger = ({ children, ...props }: { children: React.ReactNode }) => {
  const { colorScheme } = useColorScheme()

  return (
    <Button
      variant={colorScheme === 'dark' ? 'secondary' : 'default'}
      className="w-full justify-start gap-2"
      {...props}
    >
      {children}
    </Button>
  )
}

const StatusBadges = () => {
  const { device } = useDeviceContext()
  const { state } = useGeolocation()

  return (
    <View className="flex-row flex-wrap gap-2">
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
    <View className="gap-2 rounded-md bg-gray-100 p-2 dark:bg-neutral-900">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
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

// biome-ignore lint/correctness/noUnusedVariables: playground component
namespace SwitchControl {
  export type Props = {
    active: boolean
    action: (value: boolean) => void
    label: string
    className?: string
  }
}
// biome-ignore lint/correctness/noUnusedVariables: playground component
function SwitchControl({ active, action, label, className }: SwitchControl.Props) {
  function onPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action(!active)
  }

  function onCheckedChange(checked: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action(checked)
  }

  const id = useId()
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Switch
        checked={active}
        onCheckedChange={onCheckedChange}
        id={id}
        nativeID={id}
        aria-labelledby={id}
      />
      <Label nativeID={id} htmlFor={id} onPress={onPress}>
        {label}
      </Label>
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
