import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className='flex-1 items-center justify-center gap-6'>
        <Text>This screen doesn't exist.</Text>

        <Link href="/" asChild>
          <Button>
            <Text>Go to home screen!</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
