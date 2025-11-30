import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip'
import type { DeviceActivityLog } from '@workspace/backend/types'

import { getEventColor, getEventIcon } from '@/features/device-log/lib'

export namespace DeviceEventIcon {
  export type Props = {
    data: DeviceActivityLog
    className?: string
  }
}

export function DeviceEventIcon(props: DeviceEventIcon.Props) {
  const { data, className } = props
  const Icon = getEventIcon(data.type)
  const colors = getEventColor(data.type)

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={cn('grid place-items-center rounded-lg bg-muted p-2', colors, className)}>
          <Icon className={cn('size-4')} />
        </div>
      </TooltipTrigger>
      <TooltipContent>{data.type.replace('_', ' ')}</TooltipContent>
    </Tooltip>
  )
}
