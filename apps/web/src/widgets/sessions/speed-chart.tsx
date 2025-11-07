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
  speed: {
    label: 'km/h',
    color: '#8884d8',
  },
} satisfies ChartConfig

export function SpeedChart({
  data,
}: {
  data: { metadata: LocationMetadata; _creationTime: number }[]
}) {
  const chartData = useMemo(() => {
    const speedData = data
      ?.filter((i) => i.metadata.speed && i.metadata.speed >= 0)
      .map((meta) => ({
        timestamp: meta._creationTime,
        speed: Math.max(0, meta.metadata.speed!),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    return smoothData({ data: speedData, windowSize: 10, key: 'speed' }).map((item) => ({
      ...item,
      speed: +(item.speed * 3.6).toFixed(2),
    }))
  }, [data])

  return (
    <ChartContainer config={config} className="h-[150px] w-full">
      <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        <Area
          dataKey="speed"
          type="natural"
          fill="var(--color-speed)"
          fillOpacity={0.4}
          stroke="var(--color-speed)"
        />
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <ChartTooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
