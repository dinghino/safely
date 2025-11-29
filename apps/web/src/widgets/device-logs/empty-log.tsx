import {
  Empty,
  EmptyHeader,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
} from '@workspace/ui/components/empty'
import { CookieIcon } from 'lucide-react'

export function EmptyLogs() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CookieIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing to see</EmptyTitle>
        <EmptyDescription>No activity recorded for this device</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
