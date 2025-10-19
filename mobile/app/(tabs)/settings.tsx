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

import { type Geolocation, type Location, useGeolocation } from '@/components/contexts/geolocation'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { BellMinusIcon, ChevronDown, MapPinMinus } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'

export default function AppSettings() {
  const geo = useGeolocation()
  const { state, dispatch, events, locations } = geo
  const { enabled, debug } = state

  const start = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    BackgroundGeolocation.start().then((state) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      dispatch({ type: 'update', payload: { enabled: state.enabled } })
    })
  }, [dispatch])

  const stop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    BackgroundGeolocation.stop().then((state) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      dispatch({ type: 'update', payload: { enabled: state.enabled } })
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
      dispatch({ type: 'update', payload: { debug } }),
    )
  }, [debug, dispatch])

  const lastEvents = useMemo(() => {
    if (events.length <= 5) return events
    return events.slice(-5).reverse()
  }, [events])
  const restEvents = useMemo(() => {
    if (events.length <= 5) return []
    return events.slice(0, -5).reverse()
  }, [events])

  return (
    <>
      {/* <SafeAreaView> */}
      <StatusBar style="auto" translucent />
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="gap-2 px-4">
        {/* <Text className="mb-4 font-bold text-xl">Geolocation debugging</Text> */}
        <View className="flex-row justify-stretch gap-2">
          {enabled ? (
            <Control className="flex-1" variant="destructive" label="Stop" action={stop} />
          ) : (
            <Control className="flex-1" variant="default" label="Start" action={start} />
          )}
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
          <Control
            className="flex-1"
            label={`${debug ? 'Disable' : 'Enable'} Debug`}
            active={!!debug}
            variant="secondary"
            action={toggleDebug}
          />
          {/* <SwitchControl
            className="flex-1"
            // variant="outline"
            label="Debug Mode"
            active={!!debug}
            action={toggleDebug}
          /> */}
        </View>
      </View>

      <ScrollView className="m-4 min-h-48" contentContainerClassName="gap-4">
        <View className="gap-2 rounded-md bg-gray-100 p-2 dark:bg-neutral-900">
          <Text className="mb-2 ml-4 font-bold text-lg">Events</Text>
          {!events.length && (
            <Text className="pl-4 text-start text-foreground/75 text-lg">
              No events received yet.
            </Text>
          )}
          {lastEvents.map((event, i) => (
            <EventCard key={`${event.timestamp}--${i}`} event={event} />
          ))}
          {restEvents.length > 0 && (
            <Collapsible className="gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Text className="sticky top-0"> {restEvents.length} more events</Text>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="gap-2">
                {restEvents.map((event, i) => (
                  <EventCard key={`${event.timestamp}--${i}`} event={event} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </View>
        <View className="gap-2 rounded-md bg-gray-100 p-2 dark:bg-neutral-900">
          <Text className="mb-2 ml-4 font-bold text-lg">Locations</Text>
          {!locations.length && (
            <Text className="pl-4 text-start text-foreground/75 text-lg">
              No locations recorded yet.
            </Text>
          )}
          {locations.map((location, i) => (
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
  label: string
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
        <Text>{label}</Text>
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
      <Icon
        as={ChevronDown}
        className="size-6 transition-transform duration-200 data-[state=open]:rotate-180"
      />
      {children}
    </Button>
  )
}
function EventCard({ event }: { event: Geolocation.Event }) {
  return (
    <Collapsible className="gap-2">
      <CollapsibleTrigger asChild>
        <Trigger>
          <View className="flex flex-row justify-between gap-8">
            <Text className="">{new Date(event.timestamp).toLocaleString()}</Text>
            <Text>{event.name}</Text>
          </View>
        </Trigger>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="p-4">
          <CardContent>
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
