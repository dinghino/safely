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

export function SpeedChart({
  data,
}: {
  data: { metadata: LocationMetadata; _creationTime: number }[]
}) {
  const chartData = useMemo(() => {
    return smoothSpeedData(
      data
        ?.filter((i) => i.metadata.speed && i.metadata.speed >= 0)
        .map((meta) => ({
          timestamp: meta._creationTime,
          speed: msToKmh(meta.metadata.speed!),
        }))
        .sort((a, b) => a.timestamp - b.timestamp),
      10,
    )
  }, [data])
  const config = useMemo(
    () =>
      ({
        speed: {
          label: 'km/h',
          color: '#8884d8',
        },
      }) satisfies ChartConfig,
    [],
  )

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
        <ChartTooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  )
}

function msToKmh(ms: number) {
  return ms * 3.6
}

function smoothSpeedData(data: { speed: number }[], windowSize: number): { speed: number }[] {
  const smoothedData = data.map((_, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2))
    const end = Math.min(data.length, index + Math.ceil(windowSize / 2))
    const window = data.slice(start, end)
    const averageSpeed = window.reduce((sum, point) => sum + point.speed, 0) / window.length
    return { speed: averageSpeed }
  })
  return smoothedData
}
