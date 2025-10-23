import { THEME } from '@/lib/theme'
import { useColorScheme } from 'nativewind'
import { useMemo } from 'react'

export function useBackgroundColor() {
  const { colorScheme } = useColorScheme()

  return useMemo(() => {
    if (!colorScheme) return THEME.light.card
    return THEME[colorScheme].card
  }, [colorScheme])
}
