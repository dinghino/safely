import { useCallback, useState } from 'react'
import BackgroundGeolocation from 'react-native-background-geolocation'

import { Button } from '@/components/ui/button'

import { useGeolocation } from '@/components/contexts/geolocation'
import { Icon } from '@/components/ui/icon'
import { LocateFixedIcon, LocateIcon } from 'lucide-react-native'
import { action } from '@/components/contexts/geolocation/geolocation.context'

export function WatchPositionButton() {
  const { state, dispatch } = useGeolocation()
  const [watching, setWatching] = useState(false)

  const toggleWatch = useCallback(async () => {
    if (watching) {
      // stop watching
      BackgroundGeolocation.stopWatchPosition(() => {
        setWatching(false)
        dispatch(action.event({ name: '🛑 stop watchPosition', data: { watching: false } }))
      })
    } else {
      // start watching
      BackgroundGeolocation.watchPosition((location) => {
        setWatching(true)
        dispatch(action.location(location))
      })
    }
  }, [watching, dispatch])
  return (
    <Button disabled={!state.enabled} variant="secondary" size="icon" onPress={toggleWatch}>
      <Icon as={watching ? LocateFixedIcon : LocateIcon} />
    </Button>
  )
}
