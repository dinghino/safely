import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'

export default function ModalView() {
  return (
    <>
      <Stack.Screen options={{ title: 'Modal View' }} />
      <SafeAreaView>
        <Text>This is a modal view!</Text>
        <Link href="/" dismissTo asChild>
          <Button>
            <Text>Go to home screen</Text>
          </Button>
        </Link>
      </SafeAreaView>
    </>
  )
}
