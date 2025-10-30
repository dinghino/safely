import { View } from 'react-native'
import ActionSheet, {
  FlatList,
  type Route,
  // RouteScreenProps,
  useSheetRouter,
  // useSheetRouteParams,
  ScrollView,
} from 'react-native-actions-sheet'
import * as Haptics from 'expo-haptics'
import { ArrowLeft, BellMinusIcon, FilterIcon, FilterXIcon } from 'lucide-react-native'

import { useBackgroundColor } from '@/lib/hooks/use-background-color'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'

import { useGeolocation } from '@/components/contexts/geolocation'
import { EventCard, FilterProvider, useEventsFilterContext } from '../debug/events-view'
import { useMemo } from 'react'
import { Badge } from '../ui/badge'
import { SwitchControl } from '../switch-control'

export namespace DebugGeoEventsSheet {
  export type Props = {}
}

const routes: Route[] = [
  {
    name: 'events-list',
    component: EventsView,
  },
  {
    name: 'events-filter',
    component: FiltersView,
  },
] as const

export const DebugGeoEventsSheet: React.FC<DebugGeoEventsSheet.Props> = (_props) => {
  const backgroundColor = useBackgroundColor()

  return (
    <FilterProvider>
      <ActionSheet
        gestureEnabled
        useBottomSafeAreaPadding
        enableRouterBackNavigation
        closable
        snapPoints={[100]}
        containerStyle={{ backgroundColor, gap: 8 }}
        routes={routes}
        initialRoute='events-list'
      />
    </FilterProvider>
  )
}

function EventsView() {
  const router = useSheetRouter('debug-geo-events')
  const { events, clearEvents } = useGeolocation()
  const { active, names } = useEventsFilterContext()

  const filtered = useMemo(() => {
    if (active.length === 0) return []
    return events.filter((e) => active.includes(e.name)).toReversed()
  }, [events, active])

  return (
    <>
      <View className="mx-2 flex-row items-center justify-between rounded-lg bg-muted p-2">
        <View className="flex-row items-center gap-2">
          <Button variant="outline" size="icon" onPress={() => router?.navigate('events-filter')}>
            {active.length !== names.length ? (
              <Icon as={FilterXIcon} className="size-4" />
            ) : (
              <Icon as={FilterIcon} className="size-4" />
            )}
          </Button>
          {/* todo: add filter sheet with routes */}
          <Text className="font-bold text-lg">Events</Text>
          <Badge className="text-muted-foreground">
            <Text>{events.length}</Text>
          </Badge>
        </View>
        <View className="flex-row items-center gap-2">
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
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.timestamp}--${i}`}
        className="px-2"
        contentContainerClassName="gap-2 py-4"
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </>
  )
}

function FiltersView() {
  const router = useSheetRouter('debug-geo-events')
  const { active, names, ...filters } = useEventsFilterContext()
  return (
    <View className="gap-4 p-4">
      <View className="flex-row items-center gap-2">
        <Button size="icon" variant="outline" onPress={() => router?.goBack()}>
          <Icon as={ArrowLeft} className="size-4" />
        </Button>
        <Text className="font-bold text-lg">Filter Events</Text>
      </View>
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
  )
}
