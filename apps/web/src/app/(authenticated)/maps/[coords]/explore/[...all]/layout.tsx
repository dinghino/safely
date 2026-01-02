import PlacesBreadcrumbs, {
  preparePlacesBreadcrumbs,
} from '@/entities/places/components/places-breadcrumbs'
import { Separator } from '@workspace/ui/components/separator'

type Props = {
  children: React.ReactNode
  params: Promise<{ all: string[] }>
}

export default async function MapExploreLayout(props: Props) {
  const { all } = await props.params
  const breadcrumbs = await preparePlacesBreadcrumbs({ slugs: all, startAt: 0 })

  return (
    <div className="space-y-4">
      <nav className="text-nowrap">
        <PlacesBreadcrumbs root="/places/explore" breadcrumbs={breadcrumbs} />
      </nav>
      <Separator />
      {props.children}
    </div>
  )
}
