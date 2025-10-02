import { Link } from 'expo-router'
import { View, Text } from 'react-native'

export default function TabsHome() {
  return (
    <View>
      <Text>Home Screen</Text>
      <Link href="/">Go Home</Link>
    </View>
  )
}
