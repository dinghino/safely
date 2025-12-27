'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { usePlacePopup } from './place-popup-context'

export namespace PlacePopupAttribution {
  export type Props = Record<string, never>
}

export const PlacePopupAttribution = () => {
  const { attribution } = usePlacePopup()

  if (!attribution) return null

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Source</span>
        <Badge variant="outline" className="h-4 px-1 text-[9px]">
          {attribution.source}
        </Badge>
      </div>

      {attribution.url && (
        <Button asChild size="sm" variant="secondary" className="mt-1 h-8 w-full text-[11px]">
          <a href={attribution.url} target="_blank" rel="noreferrer">
            View on {attribution.source}
          </a>
        </Button>
      )}
    </>
  )
}
