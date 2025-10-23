import { View } from 'react-native'
import * as Haptics from 'expo-haptics'

import { Text } from '@/components/ui/text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

import { type Location, useGeolocation } from '@/components/contexts/geolocation'

import { Icon } from '@/components/ui/icon'
import { MapPinMinus } from 'lucide-react-native'
import { Trigger } from './collapse-button'

export default function LocationsDebugView() {
  const { locations, clearLocations } = useGeolocation()
  return (
    <View className="gap-2 rounded-md p-2">
      <View className="flex-row items-center justify-between rounded-lg bg-muted p-1">
        <Text className="pl-4 font-bold text-lg">Locations</Text>
        <Button
          disabled={!locations.length}
          size="icon"
          variant="destructive"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
            clearLocations()
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
