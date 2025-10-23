import { Stack, Tabs } from 'expo-router'

import { CogIcon, HomeIcon, MapIcon } from 'lucide-react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'

import GeolocationProvider from '@/components/contexts/geolocation'
import { DeviceManager } from '@/components/contexts/device-manager'
import { RequestsManager } from '@/components/contexts/requests-manager'

import { SheetProvider } from 'react-native-actions-sheet'
import '@/constants/sheets'

export default function TabLayout() {
  const { colorScheme } = useColorScheme()

  return (
    <>
      <Stack.Screen options={{ title: 'Main tabs layout' }} />
      <DeviceManager>
        <RequestsManager />
        <GeolocationProvider>
          {/*
          todo: this should be at higher level but we require feature contexts
          to be above it so we can consume their data/actions in sheets.
          at least device manager for now needs to be higher than sheets.
          */}
          <SheetProvider>
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: colorScheme === 'dark' ? 'white' : 'black',
                headerShown: false,
                tabBarShowLabel: false,
                tabBarLabelPosition: 'beside-icon',
                // tabBarButton: HapticTab, // from default expo template
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Home',
                  tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
                }}
              />
              <Tabs.Screen
                name="settings"
                options={{
                  title: 'Settings',
                  tabBarIcon: ({ color }) => <CogIcon size={28} color={color} />,
                }}
              />
              <Tabs.Screen
                name="map"
                options={{
                  title: 'Map',
                  tabBarIcon: ({ color }) => <MapIcon size={28} color={color} />,
                }}
              />
            </Tabs>
          </SheetProvider>
        </GeolocationProvider>
      </DeviceManager>
    </>
  )
}
