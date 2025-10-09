'use client'

import { ButtonGroup } from '@workspace/ui/components/button-group'
import { cn } from '@/lib/utils'

import { LeafletMap, ZoomControls } from '@/shared/modules/maps'
import { CenterMapButton, UserLocation } from '@/widgets/maps'

export const LastKnownLocationMap = () => {
  return (
    <LeafletMap className="h-full w-full bg-background" scrollWheelZoom zoomControl={false}>
      <div className={cn('leaflet-top leaflet-top pl-2')}>
        <ButtonGroup orientation="vertical">
          <ZoomControls orientation="vertical" variant="default" />
          <ButtonGroup orientation="vertical">
            <CenterMapButton />
          </ButtonGroup>
        </ButtonGroup>
      </div>
      <UserLocation />
    </LeafletMap>
  )
}
