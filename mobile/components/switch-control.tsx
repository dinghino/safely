import { useId } from 'react'
import { View } from 'react-native'
import * as Haptics from 'expo-haptics'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export namespace SwitchControl {
  export type Props = {
    active: boolean
    action: (value: boolean) => void
    label: string
    className?: string
  }
}
export const SwitchControl = ({ active, action, label, className }: SwitchControl.Props) => {
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
    <View className={cn('flex-1 flex-row items-center gap-2', className)}>
      <Switch
        checked={active}
        onCheckedChange={onCheckedChange}
        id={id}
        nativeID={id}
        aria-labelledby={id}
      />
      <View className="flex-1 py-2">
        <Label nativeID={id} htmlFor={id} onPress={onPress} className="w-full text-lg">
          {label}
        </Label>
      </View>
    </View>
  )
}
