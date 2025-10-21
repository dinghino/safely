import { Stack, Tabs } from 'expo-router'

import { CogIcon, HomeIcon } from 'lucide-react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'

import { AppHeader } from '@/components/app-header'
import GeolocationProvider from '@/components/contexts/geolocation'
import { DeviceManager } from '@/components/contexts/device-manager'
import { RequestsManager } from '@/components/contexts/requests-manager'

export default function TabLayout() {
  const { colorScheme } = useColorScheme()

  return (
    <>
      <Stack.Screen options={{ title: 'Main tabs layout' }} />
      <DeviceManager>
        <RequestsManager />
        <GeolocationProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: colorScheme === 'dark' ? 'white' : 'black',
              headerShown: false,
              header: () => <AppHeader />,
              // tabBarShowLabel: false,
              tabBarLabelPosition: 'beside-icon',
              // tabBarButton: HapticTab, // from default expo template
            }}>
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
            {/* <Tabs.Screen
            name="map"
            options={{
              title: 'Map',
              tabBarIcon: ({ color }) => <MapIcon size={28} color={color} />,
            }}
          /> */}
          </Tabs>
        </GeolocationProvider>
      </DeviceManager>
    </>
  )
}
