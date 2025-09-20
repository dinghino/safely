import { useStore } from '@tanstack/react-form'
import { useFormContext } from '../hooks'
import { Button } from '@workspace/ui/components/button'
import { Loader2 } from 'lucide-react'

export namespace SubmitButton {
  export type Props = {
    children?: React.ReactNode
  } & Omit<React.ComponentProps<typeof Button>, 'type'>
}
export const SubmitButton = (props_: SubmitButton.Props) => {
  const { children = 'Submit', ...props } = props_
  const form = useFormContext()

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
    state.isSubmitting,
    state.canSubmit,
  ])

  return (
    <Button type="submit" disabled={isSubmitting || !canSubmit} {...props}>
      {isSubmitting ? <Loader2 className="animate-spin" /> : children}
    </Button>
  )
}
