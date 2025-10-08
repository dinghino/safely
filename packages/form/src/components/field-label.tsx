import { useFieldContext } from '../hooks'
import { Label } from '@workspace/ui/components/label'

export const FieldLabel = ({ children }: { children: React.ReactNode }) => {
  const field = useFieldContext<string>()

  if (!children) return null

  if (typeof children === 'string') {
    return <Label htmlFor={field.name}>{children}</Label>
  }
  return <label htmlFor={field.name}>{children}</label>
}
