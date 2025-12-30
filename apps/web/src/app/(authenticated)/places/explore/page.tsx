import { PlacesList } from './components/places-list'
import { RelevantPlaces } from './components/relevant-places'

export default function ExplorePage() {
  return (
    <>
      <header className="mb-4 space-y-2">
        <h1 className="font-bold text-xl">Explore</h1>
        <p className="text-muted-foreground">Explore places in your area</p>
      </header>
      <div className="mb-4">
        <RelevantPlaces />
      </div>
      <div className="space-y-2">
        <PlacesList />
      </div>
    </>
  )
}
