'use client'

import { useAppForm } from '@workspace/form'

import { Badge } from '@workspace/ui/components/badge'
import dayjs from '@/lib/dayjs'

import type { DeviceSettings } from '../types'
import { Defaults, GPS_ACCURACY_OPTIONS } from '../constants'
import { DeviceOptionsSchema } from '../schemas'

export namespace DeviceOptionsForm {
  export type Props = {
    values: DeviceSettings
    onSubmit: (values: DeviceSettings) => Promise<void>
    className?: string
  }
}

/**
 * Form to edit device options for a single operating `mode` for a device.
 */
export const DeviceOptionsForm: React.FC<DeviceOptionsForm.Props> = (props) => {
  const { values, onSubmit, className } = props
  // removes extra fields if present, like _id, _creationTime etc.
  const { heartbeat, location } = values
  const form = useAppForm({
    defaultValues: { heartbeat, location },
    validators: { onChange: DeviceOptionsSchema },
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
            options={GPS_ACCURACY_OPTIONS}
          />
        )}
      />
      <div className="flex @min-lg:flex-row flex-col gap-2">
        <form.AppField
          name="location.maximumAge"
          children={(field) => (
            <field.SliderField
              label={<LabelBadge label="Maximum Age" value={field.state.value} />}
              min={Defaults.MIN_MAX_AGE}
              max={Defaults.MAX_MAX_AGE}
              step={1000}
            />
          )}
        />
        <form.AppField
          name="location.timeout"
          children={(field) => (
            <field.SliderField
              label={<LabelBadge label="Timeout" value={field.state.value} />}
              min={Defaults.MIN_TIMEOUT}
              max={Defaults.MAX_TIMEOUT}
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
            min={Defaults.MIN_HEARTBEAT}
            max={Defaults.MAX_HEARTBEAT}
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
