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
        <EmptyTitle>Relevant places</EmptyTitle>
        <EmptyDescription>
          We have no places to show you at the moment. Try selecting a category group above to
          explore
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p>
          This section will contain user relevant places based on their preferences and location.
        </p>
      </EmptyContent>
    </Empty>
  )
}
