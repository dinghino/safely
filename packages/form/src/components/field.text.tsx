import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'

import { useFieldContext } from '../hooks'
import { FieldErrors } from './field.errors'

export namespace TextField {
  export type Props = {
    label?: string
  } & React.InputHTMLAttributes<HTMLInputElement>
}
export const TextField = ({ label, ...inputProps }: TextField.Props) => {
  const field = useFieldContext<string>()

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {label && <Label htmlFor={field.name}>{label}</Label>}
        <Input
          id={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          {...inputProps}
        />
      </div>
      <FieldErrors meta={field.state.meta} />
    </div>
  )
}
