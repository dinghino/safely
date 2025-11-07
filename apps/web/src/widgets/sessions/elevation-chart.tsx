'use client'

import { useMemo } from 'react'
import type { LocationMetadata } from '@workspace/backend/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart'
import { CartesianGrid, AreaChart, Area, YAxis } from 'recharts'
import { smoothData } from '@/lib/smooth-dataset'

const config = {
  elevation: {
    label: 'meters',
    color: '#82ca9d',
  },
} satisfies ChartConfig

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
    return smoothData({ data: elevations, windowSize: 10, key: 'elevation' })
  }, [data])

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
        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />

        <ChartTooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
