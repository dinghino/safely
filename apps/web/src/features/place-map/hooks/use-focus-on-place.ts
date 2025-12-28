import { useQueryState } from '@workspace/nuqs'
import { parseAsId } from '@/lib/utils'
import type { Id } from '@workspace/backend/types'

export function useFocusOnPlace() {
  const [focusedPlaceId, setFocusedPlaceId] = useQueryState(
    'place',
    parseAsId<Id<'pois'>>(), // Using 'pois' as the generic type for the ID
  )

  const toggleFocusPlaceId = (id: Id<'pois'>) => {
    if (focusedPlaceId === id) {
      setFocusedPlaceId(null)
    } else {
      setFocusedPlaceId(id)
    }
  }

  return {
    focusedPlaceId,
    setFocusedPlaceId,
    toggleFocusPlaceId,
  }
}
