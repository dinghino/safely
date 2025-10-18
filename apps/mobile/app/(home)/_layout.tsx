import { SignOutButton } from '@/components/sign-out-button'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Redirect, Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { CodeIcon, CogIcon, HomeIcon } from 'lucide-react-native'

export default function HomeLayout() {
  return (
    <>
      <SignedIn>
      <StatusBar style="inverted" />

        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveBackgroundColor: '#333',
            tabBarInactiveBackgroundColor: '#1a1a1a',
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: { backgroundColor: '#1a1a1a' },
            tabBarLabelPosition: 'beside-icon',
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#fff',
            headerRightContainerStyle: { paddingRight: 8 },
            headerRight: () => <HeaderRight />,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="gps"
            options={{
              title: 'GPS',
              tabBarIcon: ({ color, size }) => <CodeIcon size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, size }) => <CogIcon size={size} color={color} />,
            }}
          />
        </Tabs>
      </SignedIn>
      <SignedOut>
        <Redirect href="/sign-in" />
      </SignedOut>
    </>
  )
}

function HeaderRight() {
  return (
    <>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Redirect href="/sign-in" />
        {/* <Link href="/sign-in" asChild>
          <Button title="Sign in" />
        </Link> */}
      </SignedOut>
    </>
  )
}
