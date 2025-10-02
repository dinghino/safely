import { Link } from 'expo-router'
import { View, Text } from 'react-native'

export default function DemoPage() {
  return (
    <View style={{ gap: 16, flex: 1 }}>
      <Text>Demo Screen</Text>
      <Link href="/tabs/">Go to Home Tab</Link>
    </View>
  )
}
