import { useStore } from '@tanstack/react-form'
import { useFormContext } from '../hooks'
import { Button } from '@workspace/ui/components/button'
import { Loader2 } from 'lucide-react'

export namespace SubmitButton {
  export type Props = {
    children: React.ReactNode
  }
}
export const SubmitButton = ({ children }: SubmitButton.Props) => {
  const form = useFormContext()

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
    state.isSubmitting,
    state.canSubmit,
  ])

  return (
    <Button type="submit" disabled={isSubmitting || !canSubmit}>
      {isSubmitting ? <Loader2 className="animate-spin" /> : children}
    </Button>
  )
}
