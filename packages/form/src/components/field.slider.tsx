import { Slider } from '@workspace/ui/components/slider'
import { Label } from '@workspace/ui/components/label'

import { useFieldContext } from '../hooks'
import { FieldErrors } from './field.errors'
import type { SharedFieldProps } from './types'

export namespace SliderField {
  export type Props = SharedFieldProps &
    Omit<React.ComponentProps<typeof Slider>, 'onValueChange' | 'value' | 'name'>
}
export const SliderField = (props: SliderField.Props) => {
  const { label, ...rest } = props
  const field = useFieldContext<number>()

  return (
    <div className="w-full space-y-2">
      <div className="space-y-2">
        {label && <Label htmlFor={field.name}>{label}</Label>}
        <Slider
          {...rest}
          onValueChange={(v) => field.handleChange(v[0]!)}
          value={[field.state.value]}
          name={field.name}
        />
      </div>
      <FieldErrors meta={field.state.meta} />
    </div>
  )
}
