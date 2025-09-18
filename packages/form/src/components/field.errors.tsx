import type { AnyFieldMeta } from '@tanstack/react-form'
import type { ZodError } from 'zod'

export namespace FieldErrors {
  export type Props = {
    meta: AnyFieldMeta
  }
}

export const FieldErrors = ({ meta }: FieldErrors.Props) => {
  if (!meta.isTouched) return null

  return meta.errors.map(({ message }: ZodError, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: nothing else to index on
    <p key={index} className="font-medium text-destructive text-sm">
      {message}
    </p>
  ))
}
