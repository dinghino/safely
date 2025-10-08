import { createFormHook, createFormHookContexts, formOptions } from '@tanstack/react-form'
import { TextField, SubmitButton, SelectField, SliderField } from '../components'

export { formOptions }

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    SelectField,
    SliderField,
    // CheckboxField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})
