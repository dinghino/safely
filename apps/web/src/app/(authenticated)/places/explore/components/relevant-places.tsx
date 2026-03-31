import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'

export function RelevantPlaces() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Highlights</EmptyTitle>
        <EmptyDescription>
          We have no special places to show you at the moment.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p>
          We'll show you some special places based on your location and preferences
          as soon as they come up!
        </p>
      </EmptyContent>
    </Empty>
  )
}
