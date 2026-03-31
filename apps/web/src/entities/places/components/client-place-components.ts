'use client'
/**
 * This file exports client-side context-aware versions of our place components
 * to be used along PlaceProvider
 */
import { createPlaceContextConsumer } from './place-context'
import { PlaceAttributionComponent } from './place-attribution'
import { PlaceDescriptionComponent } from './place-description'
import { PlaceHeaderComponent } from './place-header'
import { PlaceLocationComponent } from './place-location'
import { PlaceRatingComponent } from './place-rating'
import { PlaceThumbnailComponent } from './place-thumbnail'
import { PlaceTitleComponent } from './place-title'

export const PlaceAttribution = createPlaceContextConsumer(PlaceAttributionComponent)
export const PlaceDescription = createPlaceContextConsumer(PlaceDescriptionComponent)
export const PlaceHeader = createPlaceContextConsumer(PlaceHeaderComponent)
export const PlaceLocation = createPlaceContextConsumer(PlaceLocationComponent)
export const PlaceRating = createPlaceContextConsumer(PlaceRatingComponent)
export const PlaceThumbnail = createPlaceContextConsumer(PlaceThumbnailComponent)
export const PlaceTitle = createPlaceContextConsumer(PlaceTitleComponent)
