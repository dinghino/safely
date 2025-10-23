import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { View } from 'react-native'

export default function ModalView() {
  return (
    <>
      <Stack.Screen options={{ title: 'Modal View' }} />
      <SafeAreaView className="min-h-full gap-4 p-8">
        <Text>This is a modal view!</Text>
        <View className="flex-1" />
        <Link href="/" dismissTo asChild>
          <Button>
            <Text>Go to home screen</Text>
          </Button>
        </Link>
      </SafeAreaView>
    </>
  )
}
