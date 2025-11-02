import { ScrollView, View } from 'react-native'
import { useMutation } from 'convex/react'
import type { TrackingMode } from '@workspace/backend/types'
import { api } from '@workspace/backend/api'

import { useDeviceContext } from '@/components/contexts/device-manager'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

type Option = { value: TrackingMode; label: string }
const options: Option[] = [
  { value: 'off', label: 'Off' },
  { value: 'passive', label: 'Passive' },
  { value: 'active', label: 'Active' },
  { value: 'aggressive', label: 'Aggressive' },
]
/**
 * Fully featured Component to see and change the tracking mode for the device.
 * This works by calling the server mutation to update the device mode.
 * @note this will likely change in the future to support more scenarios,
 * like migrating to a requests based system for all settings.
 */
export function TrackingModeControl() {
  const { device } = useDeviceContext()
  const setModeMutation = useMutation(api.devices.manage.setTrackingMode)

  const handleOptionPress = async (value: TrackingMode) => {
    if (!device) return
    await setModeMutation({ mode: value, deviceId: device._id })
  }

  return (
    <ScrollView nestedScrollEnabled contentContainerClassName="flex gap-4">
      <Text className="font-bold text-lg">Device mode</Text>
      <View className="gap-1">
        {options.map(({ value, label }) => (
          <Button
            key={value}
            disabled={!device || device.mode === value}
            className="w-full"
            onPress={() => handleOptionPress(value)}
          >
            <Text>{label}</Text>
          </Button>
        ))}
      </View>
    </ScrollView>
  )
}
