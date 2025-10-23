'use client'
import { createColumnHelper, type ColumnDef } from '@workspace/data-table'
// import { createColumnConfigHelper } from '@workspace/data-filter'
import dayjs from 'dayjs'
import type { SessionLocation } from './types'
import { Badge } from '@workspace/ui/components/badge'

const c = createColumnHelper<SessionLocation>()
// const dtf = createColumnConfigHelper<SessionLocation>()

export const getColumns = () => {
  return [
    c.accessor((r) => r._creationTime, {
      id: 'timestamp',
      header: 'Timestamp',
      cell: ({ cell }) => (
        <div>
          <p className="font-medium">{dayjs(cell.getValue()).format('HH:mm:ss')}</p>
          <p className="text-muted-foreground text-xs">{dayjs(cell.getValue()).fromNow()}</p>
        </div>
      ),
    }),
    c.accessor((r) => r.coordinates?.latitude, {
      id: 'latitude',
      header: 'Latitude',
      cell: ({ cell }) => cell.getValue()?.toFixed(6) ?? 'n/a',
    }),
    c.accessor((r) => r.coordinates?.longitude, {
      id: 'longitude',
      header: 'Longitude',
      cell: ({ cell }) => cell.getValue()?.toFixed(6) ?? 'n/a',
    }),
    c.accessor((r) => r.metadata?.accuracy ?? -1, {
      id: 'accuracy',
      header: 'Accuracy (m)',
      cell: ({ cell }) => <NumericCellValue value={cell.getValue()} />,
    }),
    c.accessor((r) => r.metadata?.altitude ?? -1, {
      id: 'altitude',
      header: 'Altitude (m)',
      cell: ({ cell }) => <NumericCellValue value={cell.getValue()} />,
    }),
    c.accessor((r) => r.metadata?.speed, {
      id: 'speed',
      header: 'Speed (m/s)',
      cell: ({ cell }) => <NumericCellValue value={cell.getValue()} precision={2} />,
    }),
    c.accessor((r) => r.metadata?.heading, {
      id: 'heading',
      header: 'Heading (°)',
      cell: ({ cell }) => <NumericCellValue value={cell.getValue()} precision={0} />,
    }),
  ] as ColumnDef<SessionLocation>[]
}

type NumericCellValueProps = {
  value: number | undefined | null
  precision?: number
}

function NumericCellValue({ value, precision = 1 }: NumericCellValueProps) {
  if (value === null || value === undefined) return null
  if (value < 0) return <Badge variant="secondary">n/a</Badge>
  return <Badge>{value.toFixed(precision)}</Badge>
}
