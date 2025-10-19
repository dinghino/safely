import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Text } from '@/components/ui/text'
import { useAuth, useUser } from '@clerk/clerk-expo'
import type { TriggerRef } from '@rn-primitives/popover'
import { LogOutIcon, PlusIcon, SettingsIcon, UserIcon } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

type User = ReturnType<typeof useUser>['user']

export function UserMenu() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const popoverTriggerRef = React.useRef<TriggerRef>(null)

  async function onSignOut() {
    popoverTriggerRef.current?.close()
    await signOut()
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="secondary" size="icon" className="size-8 rounded-full">
          <UserAvatar />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-80 p-0">
        <View className="z-50 gap-3 border-border border-b bg-background p-3">
          <View className="flex-row items-center gap-3">
            <UserAvatar className="size-10" />
            <View className="flex-1">
              <Text className="font-medium leading-5">{getFullName(user)}</Text>
              {user?.fullName?.length ? (
                <Text className="font-normal text-muted-foreground text-sm leading-4">
                  {getUsername(user)}
                </Text>
              ) : null}
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3 py-0.5">
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                // TODO: Navigate to account settings screen
              }}
            >
              <Icon as={SettingsIcon} className="size-4" />
              <Text>Manage Account</Text>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onPress={onSignOut}>
              <Icon as={LogOutIcon} className="size-4" />
              <Text>Sign Out</Text>
            </Button>
          </View>
        </View>
        <Button
          variant="ghost"
          size="lg"
          className="h-16 justify-start gap-3 rounded-none rounded-b-md px-3 sm:h-14"
          onPress={() => {
            // TODO: Navigate to add account screen
          }}
        >
          <View className="size-10 items-center justify-center">
            <View className="size-7 items-center justify-center rounded-full border border-border border-dashed bg-muted/50">
              <Icon as={PlusIcon} className="size-5" />
            </View>
          </View>
          <Text>Add account</Text>
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function UserAvatar(props: Omit<React.ComponentProps<typeof Avatar>, 'alt'>) {
  const { user } = useUser()

  const { initials, imageSource, userName } = React.useMemo(() => {
    const userName = getFullName(user)
    const initials = getInitials(userName)
    const imageSource = getUserImageSource(user)
    return { initials, imageSource, userName }
  }, [user])

  return (
    <Avatar alt={`${userName}'s avatar`} {...props}>
      {/* <AvatarImage source={imageSource} /> */}
      <AvatarFallback className="bg-red-500">
        {/* <Text>{initials}</Text> */}
        <Icon as={UserIcon} className="size-4 text-white" />
      </AvatarFallback>
    </Avatar>
  )
}

function getFullName(user: User) {
  if (!user) return 'Unknown'
  return user?.fullName || user?.emailAddresses[0]?.emailAddress || 'Unknown'
}

function getUsername(user: User) {
  if (!user) return 'unknown'
  return user?.username || 'unknown'
}

function getUserImageSource(user: User) {
  if (!user?.imageUrl) return undefined
  return { uri: user.imageUrl }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}
