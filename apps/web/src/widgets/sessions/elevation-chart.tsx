'use client'

import { useMemo } from 'react'
import type { LocationMetadata } from '@workspace/backend/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart'
import { CartesianGrid, AreaChart, Area } from 'recharts'

export function ElevationChart({
  data,
}: {
  data: { metadata: LocationMetadata; _creationTime: number }[]
}) {
  const chartData = useMemo(() => {
    const elevations = data
      ?.filter((i) => i.metadata.altitude && i.metadata.altitude >= 0)
      .map((meta) => ({
        timestamp: meta._creationTime,
        elevation: meta.metadata.altitude!,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
    return elevations
  }, [data])
  const config = useMemo(
    () =>
      ({
        elevation: {
          label: 'meters',
          color: '#82ca9d',
        },
      }) satisfies ChartConfig,
    [],
  )
  return (
    <ChartContainer config={config} className="h-[150px] w-full">
      <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        <Area
          dataKey="elevation"
          type="natural"
          fill="var(--color-elevation)"
          fillOpacity={0.4}
          stroke="var(--color-elevation)"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
