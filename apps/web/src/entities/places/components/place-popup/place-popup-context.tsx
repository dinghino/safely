'use client'

import { createContext } from '@workspace/react-utils'
import type { Place } from '@/entities/places/types'

const [PlacePopupProvider, usePlacePopup] = createContext<Place>('PlacePopup')

export { PlacePopupProvider, usePlacePopup }
