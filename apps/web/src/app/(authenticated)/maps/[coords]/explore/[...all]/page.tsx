// 'use client'
import { PlacesList } from '@/app/(authenticated)/places/explore/components/places-list'
// import { PlaceProvider } from '@/entities/places/components'
// import { ColoredCategoryIcon } from '@/entities/places/components/category-icon'
// import { usePlacesMap } from '@/features/place-map'

export default async function CatchallPlacesPage() {
  return <PlacesList />
}
// export default function CatchallPlacesPage() {
//   const { places } = usePlacesMap()

//   return (
//     <div className="flex flex-col gap-2">
//       {places.map((place) => (
//         <PlaceProvider key={place._id} place={place}>
//           <article className="inline-flex gap-2">
//             <ColoredCategoryIcon category={place.category} />
//             <div>
//               <h3 className="font-semibold">{place.name}</h3>
//               <p className="text-xs text-muted-foreground">{place.description}</p>
//             </div>
//           </article>
//         </PlaceProvider>
//       ))}
//     </div>
//   )
// }
