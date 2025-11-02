import { Text } from '@/components/ui/text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import type { Location } from '@/components/contexts/geolocation'

import { Trigger } from './collapse-button'
import { Badge } from '../ui/badge'

export function LocationCard(props: { location: Location; index?: number }) {
  const { location, index } = props
  return (
    <Collapsible className="gap-2">
      <CollapsibleTrigger asChild>
        <Trigger>
          {index !== undefined ? (
            <Badge>
              <Text>{(index + 1).toString().padStart(3, '0')}</Text>
            </Badge>
          ) : null}
          <Text>{new Date(location.timestamp).toLocaleString()}</Text>
        </Trigger>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card key={location.timestamp} className="py-2">
          <CardHeader>
            <CardTitle>
              {location.coords.latitude}, {location.coords.longitude}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-xs">{JSON.stringify(location, null, 2)}</Text>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
