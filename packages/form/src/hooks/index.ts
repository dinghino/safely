import { createFormHook, createFormHookContexts, formOptions } from '@tanstack/react-form'
import { TextField, SubmitButton } from '../components'

export { formOptions }

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    // CheckboxField,
    // SelectField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})
