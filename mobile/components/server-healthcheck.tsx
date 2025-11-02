import { View } from 'react-native'
import { useQuery } from 'convex/react'

import { api } from '@workspace/backend/api'

import { cn } from '@/lib/utils'

import { Text } from '@/components/ui/text'

export const ServerHealthcheck = () => {
  const check = useQuery(api.system.healthcheck)

  const isOk = check === 'OK'
  const isUnknown = check === undefined

  const dotStyle = cn('aspect-square size-3 rounded-full', {
    'bg-green-500': isOk,
    'bg-gray-500': isUnknown,
    'bg-red-500': !isOk && !isUnknown,
  })

  return (
    <View className="flex-row items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-500/20 px-2 py-1">
      <View className={dotStyle} />
      <Text>{isOk ? 'connected' : isUnknown ? 'unknown' : 'error'}</Text>
    </View>
  )
}
