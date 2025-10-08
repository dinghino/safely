'use client'

import z from 'zod/v4'
import { useAppForm } from '@workspace/form'
import type { TrackingMode } from '@workspace/backend/types'

import type { DeviceSettings } from '../types'
import dayjs from '@/lib/dayjs'
import { Badge } from '@workspace/ui/components/badge'

export namespace DeviceOptionsForm {
  export type Props = {
    values: DeviceSettings
    onSubmit: (values: DeviceSettings) => Promise<void>
    mode: TrackingMode // fixme: pointless
    className?: string
  }
}

const MIN_HEARTBEAT = 1000 * 60 // 1 minute
const MAX_HEARTBEAT = 1000 * 60 * 60 // 1 hour

const MIN_MAX_AGE = 1000 * 60 // 1 minute
const MAX_MAX_AGE = 1000 * 60 * 60 // 1 hour

const MIN_TIMEOUT = 1000 * 5 // 5 seconds
const MAX_TIMEOUT = 1000 * 60 * 2 // 2 minutes

/**
 * Validation schema for device options form
 * @todo setup convex to use zod directly.
 * @see https://stack.convex.dev/typescript-zod-function-validation#using-zod-for-argument-validation-server-side
 */
const OptionsSchema = z.object({
  heartbeat: z.object({
    interval: z
      .number()
      .min(MIN_HEARTBEAT)
      .max(MAX_HEARTBEAT)
      .describe('Interval in ms between heartbeats'),
  }),
  location: z.object({
    accuracy: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH']), // maps to GPSAccuracy from backend
    maximumAge: z
      .number()
      .min(MIN_MAX_AGE)
      .max(MAX_MAX_AGE)
      .describe('Maximum age in ms of a cached location'),
    timeout: z
      .number()
      .min(MIN_TIMEOUT)
      .max(MAX_TIMEOUT)
      .describe('Timeout in ms to fetch a new location'),
  }),
})

/**
 * Form to edit device options for a single operating `mode` for a device.
 */
export const DeviceOptionsForm: React.FC<DeviceOptionsForm.Props> = (props) => {
  const { values, onSubmit, className } = props
  // removes extra fields if present, like _id, _creationTime etc.
  const { heartbeat, location } = values
  const form = useAppForm({
    defaultValues: { heartbeat, location },
    validators: { onChange: OptionsSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <form.AppField
        name="location.accuracy"
        children={(field) => (
          <field.SelectField
            label="Location Accuracy"
            trigger={{ className: 'w-full' }}
            options={[
              { label: 'Very Low', value: 'VERY_LOW' },
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ]}
          />
        )}
      />
      <div className="flex @min-lg:flex-row flex-col gap-2">
        <form.AppField
          name="location.maximumAge"
          children={(field) => (
            <field.SliderField
              label={<LabelBadge label="Maximum Age" value={field.state.value} />}
              min={MIN_MAX_AGE}
              max={MAX_MAX_AGE}
              step={1000}
            />
          )}
        />
        <form.AppField
          name="location.timeout"
          children={(field) => (
            <field.SliderField
              label={<LabelBadge label="Timeout" value={field.state.value} />}
              min={MIN_TIMEOUT}
              max={MAX_TIMEOUT}
              step={1}
            />
          )}
        />
      </div>

      <form.AppField
        name="heartbeat.interval"
        children={(field) => (
          <field.SliderField
            label={<LabelBadge label="Heartbeat Interval" value={field.state.value} />}
            min={MIN_HEARTBEAT}
            max={MAX_HEARTBEAT}
            step={1000}
          />
        )}
      />
      <form.AppForm>
        <form.SubmitButton>Save Options</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

function LabelBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex w-full flex-row justify-between">
      {label}
      <Badge className="self-end font-mono text-xs" variant="secondary">
        {readable(value)}
      </Badge>
    </div>
  )
}

function readable(ms: number) {
  const value = dayjs.duration(ms, 'ms')
  if (value.asMinutes() < 1) return `${value.asSeconds().toFixed(0)} seconds`
  if (value.asMinutes() < 5) {
    const str = value.format('m [m] s [s]')
    return str
  }
  if (value.asHours() < 1) return `${value.get('minutes')} minutes`
  return dayjs.duration(ms, 'ms').humanize()
}
