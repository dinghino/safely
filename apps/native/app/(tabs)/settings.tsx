import { useCallback, useEffect, useId, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ScrollView, View } from 'react-native'
import * as Haptics from 'expo-haptics'

import BackgroundGeolocation from 'react-native-background-geolocation'

import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '@/components/ui/text'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

import { type ContextEvent, type Location, useGeolocation } from '@/components/contexts/geolocation'

import { cn } from '@/lib/utils'

export default function AppSettings() {
  const geo = useGeolocation()
  const { state, dispatch, events, locations } = geo
  const { debug } = state

  const start = useCallback(() => {
    BackgroundGeolocation.start().then((state) => {
      dispatch({ type: 'update', payload: { enabled: state.enabled } })
    })
  }, [dispatch])

  const stop = useCallback(() => {
    BackgroundGeolocation.stop().then((state) => {
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
    BackgroundGeolocation.setConfig({ debug: !debug }).then(({ debug }) =>
      dispatch({ type: 'update', payload: { debug } }),
    )
  }, [debug, dispatch])

  return (
    // <>
    <SafeAreaView>
      <StatusBar style="auto" translucent />
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="gap-2 px-4">
        <Text className="mb-4 font-bold text-xl">Geolocation debugging</Text>
        <View className="flex-row justify-stretch gap-4">
          {/* <Control
            className="flex-1"
            label="Background Geolocation"
            active={!!enabled}
            action={toggleLocator}
          /> */}
          <Control className="flex-1" variant="default" label="Start" action={start} />
          <Control className="flex-1" variant="destructive" label="Stop" action={stop} />
          <Control
            className="flex-1"
            variant="outline"
            label="Debug Mode"
            active={!!debug}
            action={toggleDebug}
          />
        </View>
      </View>

      <ScrollView
        className="m-4 min-h-48 rounded-md bg-gray-200 p-2 dark:bg-neutral-800"
        contentContainerClassName="gap-4"
      >
        {!events.length && !locations.length && (
          <Text className="text-center text-lg">No geolocation events yet.</Text>
        )}
        {events.map((event) => (
          <EventCard key={event.timestamp} event={event} />
        ))}
        {locations.map((location) => (
          <LocationCard key={location.timestamp} location={location} />
        ))}
      </ScrollView>
    </SafeAreaView>
    // </>
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
type _ControlProps = {
  active: boolean
  action: (value: boolean) => void
  label: string
  className?: string
}
function _Control({ active, action, label, className }: _ControlProps) {
  const [checked, setChecked] = useState(active)
  function onPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setChecked((prev) => {
      const next = !prev
      action(next)
      return next
    })
  }

  function onCheckedChange(checked: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setChecked(checked)
    action(checked)
  }

  useEffect(() => {
    setChecked(active)
  }, [active])

  const id = useId()
  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} id={id} nativeID={id} />
      <Label nativeID={id} htmlFor={id} onPress={onPress}>
        {label}
      </Label>
      {/* <Button
        className="w-full"
        variant={checked ? 'destructive' : 'default'}
        onPress={onPress}
        id={id}
      >
        <Text>{label}</Text>
      </Button> */}
    </View>
  )
}

function EventCard({ event }: { event: ContextEvent }) {
  return (
    <Card className="mb-2 p-4">
      <Collapsible>
        <CollapsibleTrigger>
          <CardHeader>
            <CardTitle>{event.type}</CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <Text>{new Date(event.timestamp).toLocaleString()}</Text>
            <Text>{JSON.stringify(event.data, null, 2)}</Text>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function LocationCard({ location }: { location: Location }) {
  return (
    <Card key={location.timestamp} className="mb-2 p-4">
      <Collapsible>
        <CollapsibleTrigger>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <Text>{new Date(location.timestamp).toLocaleString()}</Text>
            <Text>{JSON.stringify(location, null, 2)}</Text>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
