import { PlacesList } from './components/places-list'
import { RelevantPlaces } from './components/relevant-places'

export default function ExplorePage() {
  return (
    <>
      <div className="mb-4">
        <RelevantPlaces />
      </div>
      <div className="space-y-2">
        <PlacesList />
      </div>
    </>
  )
}
