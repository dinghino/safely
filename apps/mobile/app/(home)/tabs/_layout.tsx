import { Tabs } from 'expo-router'
import { HomeIcon, CodeIcon } from 'lucide-react-native'

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} /> }} />
      <Tabs.Screen name="demo" options={{ tabBarIcon: ({ color, size }) => <CodeIcon size={size} color={color} /> }} />
    </Tabs>
  )
}

export default TabLayout
