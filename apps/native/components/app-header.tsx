import { useColorScheme } from 'nativewind'
import { MoonStarIcon, SunIcon } from 'lucide-react-native'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { UserMenu } from '@/components/user-menu'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
}

function themeIcon(theme: 'light' | 'dark' | undefined) {
  return THEME_ICONS[theme ?? 'light']
}

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme()

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="outline" className="">
      <Icon as={themeIcon(colorScheme)} className="size-4" />
    </Button>
  )
}

export function AppHeader() {
  return (
    <SafeAreaView>
      <View
        className={cn(
          'flex-row justify-between px-4 py-2',
          'absolute top-safe right-0 left-0 web:mx-2 pt-12',
          // 'bg-indigo-700',
          'border-border border-b'
        )}
      >
        {/* <StatusBar style="auto" /> */}
        <ThemeToggle />
        <UserMenu />
      </View>
    </SafeAreaView>
  )
}
