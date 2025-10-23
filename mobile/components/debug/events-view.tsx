import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import * as Haptics from 'expo-haptics'

import ActionSheet, { type ActionSheetRef } from 'react-native-actions-sheet'

import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

import { type Geolocation, useGeolocation } from '@/components/contexts/geolocation'

import { Icon } from '@/components/ui/icon'
import { BellMinusIcon, FilterIcon, FilterXIcon } from 'lucide-react-native'
import { useBackgroundColor } from '@/lib/hooks/use-background-color'
import { SwitchControl } from '../switch-control'
import { Trigger } from './collapse-button'

type ContextValue = {
  active: string[]
  toggle: (name: string) => void
  set: (name: string, value: boolean) => void
  all: (enabled: boolean) => void
  names: string[]
}
const initialFilterState: ContextValue = {
  active: [],
  names: [],
  toggle: () => {},
  set: () => {},
  all: () => {},
}

const FilterContext = createContext<ContextValue>(initialFilterState)

const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { events } = useGeolocation()

  const _map = useRef(new Map<string, boolean>())
  const [active, setActive] = useState<string[]>([])

  const names = useMemo(() => {
    const uniqueNames = Array.from(new Set(events.map((e) => e.name)))
    return uniqueNames.sort()
  }, [events])

  const toggle = useCallback((name: string) => {
    _map.current.set(name, !_map.current.get(name))
    setActive((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }, [])

  // when new events arrive, ensure their names are in the active map and true by default
  useEffect(() => {
    events.forEach((e) => {
      if (!_map.current.has(e.name)) {
        _map.current.set(e.name, true)
        setActive((prev) => [...prev, e.name])
      }
    })
  }, [events])

  const set = useCallback((name: string, value: boolean) => {
    _map.current.set(name, value)
    setActive((prev) => {
      if (value) {
        return prev.includes(name) ? prev : [...prev, name]
      }
      // remove from active
      return prev.filter((n) => n !== name)
    })
  }, [])

  const all = useCallback(
    (enabled: boolean) => {
      names.forEach((name) => {
        _map.current.set(name, enabled)
      })
      setActive(enabled ? [...names] : [])
    },
    [names],
  )
  const value = useMemo(
    () => ({ active, toggle, names, set, all }),
    [active, toggle, names, set, all],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export default function EventsDebugView() {
  return (
    <FilterProvider>
      <EventsDebugViewContent />
    </FilterProvider>
  )
}

function EventsDebugViewContent() {
  const { events: allEvents, clearEvents } = useGeolocation()
  const { active } = useContext(FilterContext)

  const events = useMemo(() => {
    if (active.length === 0) return []
    return allEvents.filter((e) => active.includes(e.name))
  }, [allEvents, active])

  const [lastEvents, restEvents] = useMemo(() => {
    const reversed = events.toReversed()
    if (events.length <= 5) return [reversed, []]
    // split into last 5 and the rest
    return [reversed.slice(0, 5), reversed.slice(5)]
  }, [events])

  return (
    <Collapsible>
      <View className="gap-2 rounded-md p-2">
        <View className="flex-row items-center justify-between gap-4 rounded-lg bg-muted p-1">
          <View className="flex-row items-center gap-0">
            <FilterSheet />
            <Text className="font-bold text-lg">Events</Text>
          </View>
          <View className="flex-row items-center gap-2">
            {restEvents.length > 0 && (
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
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
                clearEvents()
              }}
            >
              <Icon as={BellMinusIcon} className="size-4" />
            </Button>
          </View>
        </View>
        {/* <FlatList
          data={events}
          style={{ height: 300 }}
          renderItem={({ item: event, index }) => (
            <EventCard key={`${event.timestamp}--${index}`} event={event} />
          )}
          nestedScrollEnabled
          contentContainerClassName="gap-2 px-4"
        /> */}
        {!events.length && (
          <Text className="pl-4 text-center text-foreground/75 text-lg">No events to show</Text>
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
  )
}

function EventCard({ event }: { event: Geolocation.Event }) {
  const title = useMemo(() => {
    switch (true) {
      case event.name.includes('📍 location'):
        return `${event.name} (source: ${event.data.event!})`
      default:
        return event.name
    }
  }, [event])
  return (
    <Collapsible className="gap-2">
      <CollapsibleTrigger asChild>
        <Trigger>
          <View className="flex flex-row justify-between gap-4">
            <Text className="flex-1">{title}</Text>
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

function FilterSheet() {
  const ref = useRef<ActionSheetRef>(null)
  const backgroundColor = useBackgroundColor()
  const { active, names, ...filters } = useContext(FilterContext)
  return (
    <>
      <Button variant="secondary" onPress={() => ref.current?.show()}>
        {active.length !== names.length ? (
          <Icon as={FilterXIcon} className="size-4" />
        ) : (
          <Icon as={FilterIcon} className="size-4" />
        )}
      </Button>
      <ActionSheet
        ref={ref}
        snapPoints={[100]}
        useBottomSafeAreaPadding
        gestureEnabled
        containerStyle={{ backgroundColor }}
      >
        <View className="gap-4 p-4">
          <Text className="font-bold text-lg">Filter Events</Text>
          <View className="flex-row items-center gap-2">
            {/* show/hide all buttons */}
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                filters.all(true)
              }}
            >
              <Text>Select All</Text>
            </Button>
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                filters.all(false)
              }}
            >
              <Text>Deselect All</Text>
            </Button>
          </View>
          <ScrollView>
            {names.map((name) => (
              <SwitchControl
                key={name}
                active={active.includes(name) ?? false}
                label={name}
                action={(value) => filters.set(name, value)}
              />
            ))}
          </ScrollView>
        </View>
      </ActionSheet>
    </>
  )
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
