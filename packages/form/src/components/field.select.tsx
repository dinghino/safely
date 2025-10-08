import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Label } from '@workspace/ui/components/label'

import type { SharedFieldProps } from './types'
import { useFieldContext } from '../hooks'
import { FieldErrors } from './field.errors'
import { FieldLabel } from './field-label'

export namespace SelectField {
  export type Props = SharedFieldProps & {
    options: { label: string; value: string }[]
    trigger?: Omit<React.ComponentProps<typeof SelectTrigger>, 'children' | 'ref'>
  } & Omit<React.ComponentProps<typeof Select>, 'onChange' | 'value' | 'name'>
}
export const SelectField = (props: SelectField.Props) => {
  const { label, options, trigger, ...rest } = props
  const field = useFieldContext<string>()

  return (
    <div className="w-full space-y-2">
      <div className="space-y-2">
        <FieldLabel>{label}</FieldLabel>
        <Select
          {...rest}
          onValueChange={field.handleChange}
          value={field.state.value}
          name={field.name}
        >
          <SelectTrigger {...trigger}>
            <SelectValue>
              {options.find((option) => option.value === field.state.value)?.label || 'Select...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FieldErrors meta={field.state.meta} />
    </div>
  )
}
