import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { TextField, SubmitButton } from '../components'

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
