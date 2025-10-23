import { useCallback } from 'react'
import { View } from 'react-native'
import { SettingsIcon, XIcon } from 'lucide-react-native'
import ActionSheet, { ScrollView, SheetManager } from 'react-native-actions-sheet'

import * as Haptics from 'expo-haptics'
import BackgroundGeolocation from 'react-native-background-geolocation'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { SwitchControl } from '@/components/switch-control'

import { action, useGeolocation } from '@/components/contexts/geolocation'

import { TrackingModeControl } from '@/components/tracking-mode-control'
import { useBackgroundColor } from '@/lib/hooks/use-background-color'

export namespace DeviceSettingsSheet {
  export type Props = {}
}

export const DeviceSettingsSheet: React.FC<DeviceSettingsSheet.Props> = (_props) => {
  const { dispatch, state } = useGeolocation()
  const backgroundColor = useBackgroundColor()

  const toggleDebug = useCallback(
    async (debug: boolean) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      const state = await BackgroundGeolocation.setConfig({ debug })
      dispatch(action.event({ name: '🐛 toggle debug', data: { debug: state.debug } }))
      dispatch(action.update({ debug: state.debug }))
    },
    [dispatch],
  )

  const toggleEnabled = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    const state = await toggle()
    dispatch(action.event({ name: '✅ toggle enabled', data: { enabled: state.enabled } }))
    dispatch(action.update({ enabled: state.enabled }))
  }, [dispatch])

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
    <ActionSheet
      snapPoints={[50, 100]}
      useBottomSafeAreaPadding
      gestureEnabled
      containerStyle={{ backgroundColor }}
    >
      <View className="flex-row items-center justify-between border-border border-b px-4 py-2">
        <View className="flex flex-row items-center gap-2">
          <Icon as={SettingsIcon} className="size-5" />
          <Text className="font-extrabold text-2xl">Settings</Text>
        </View>
        <Button size="icon" variant="outline" onPress={() => SheetManager.hide('device-settings')}>
          <Icon as={XIcon} />
        </Button>
      </View>
      <ScrollView contentContainerClassName="gap-8 p-4">
        <View className="gap-2">
          <SwitchControl
            active={!!state.enabled}
            action={toggleEnabled}
            label="Geolocation enabled"
          />
          <SwitchControl active={!!state.debug} action={toggleDebug} label="Debug mode" />
          <SwitchControl active={!!state.isMoving} action={togglePace} label="Track activity" />
        </View>
        <TrackingModeControl />
      </ScrollView>
    </ActionSheet>
  )
}

const toggle = async () => {
  const { enabled } = await BackgroundGeolocation.getState()
  return enabled ? BackgroundGeolocation.stop() : BackgroundGeolocation.start()
}
