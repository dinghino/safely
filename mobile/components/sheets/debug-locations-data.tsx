import { View } from 'react-native'
import ActionSheet, { FlatList } from 'react-native-actions-sheet'
import * as Haptics from 'expo-haptics'

import { useBackgroundColor } from '@/lib/hooks/use-background-color'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'

import { LocationCard } from '@/components/debug/locations-view'
import { useGeolocation } from '@/components/contexts/geolocation'
import { MapPinMinus } from 'lucide-react-native'
import { Badge } from '../ui/badge'

export namespace DebugLocationsDataSheet {
  export type Props = {}
}

export const DebugLocationsDataSheet: React.FC<DebugLocationsDataSheet.Props> = (_props) => {
  const { locations, clearLocations } = useGeolocation()
  const backgroundColor = useBackgroundColor()

  return (
    <ActionSheet
      gestureEnabled
      useBottomSafeAreaPadding
      containerStyle={{ backgroundColor, gap: 8 }}
    >
      {/* Header
       * todo: extract core layout for other debug views
       */}
      <View className="flex-row items-center justify-between p-2">
        <View className="flex-row items-center gap-2 pl-4">
          <Text className="font-bold text-lg">Locations</Text>
          <Badge className="text-muted-foreground">
            <Text>{locations.length}</Text>
          </Badge>
        </View>
        <Button
          disabled={!locations.length}
          size="icon"
          variant="destructive"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
            clearLocations()
          }}
        >
          <Icon as={MapPinMinus} className="size-4 text-background" />
        </Button>
      </View>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.uuid}
        className="px-2"
        contentContainerClassName="gap-2 py-4"
        renderItem={({ item, index }) => <LocationCard location={item} index={index} />}
      />
    </ActionSheet>
  )
}
