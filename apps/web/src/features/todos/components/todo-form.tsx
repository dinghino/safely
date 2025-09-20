'use client'

import { cn } from '@/lib/utils'
import { useAddTodo, useUpdateTodo } from '../hooks'
import { useAppForm } from '@workspace/form'
import z from 'zod/v4'
import { PlusIcon } from 'lucide-react'
import type { Todo } from '../types'

const TodoFormSchema = z.object({
  text: z.string().min(1, 'Title is required'),
})

const handleSubmit = (form: { handleSubmit: () => Promise<void> }) => (e: React.FormEvent) => {
  e.preventDefault()
  form.handleSubmit()
}

export namespace CreateTodoForm {
  export type Props = {
    className?: string
    onSuccess?: () => void
  }
}

export const CreateTodoForm = (props: CreateTodoForm.Props) => {
  const { className, onSuccess } = props

  const addTodo = useAddTodo()
  const form = useAppForm({
    defaultValues: { text: '' },
    validators: { onChange: TodoFormSchema },
    onSubmit: async ({ value }) => {
      await addTodo(value, onSuccess)
      form.reset()
    },
  })

  return (
    <form onSubmit={handleSubmit(form)} className={cn('flex items-start gap-2', className)}>
      <form.AppField
        name="text"
        children={(field) => <field.TextField className="flex-1" placeholder="Add a new task..." />}
      />
      <form.AppForm>
        <form.SubmitButton size="icon">
          <PlusIcon />
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

export namespace EditTodoForm {
  export type Props = CreateTodoForm.Props & {
    todo: Todo
  }
}

export const EditTodoForm = (props: EditTodoForm.Props) => {
  const { todo, className, onSuccess } = props

  const editTodo = useUpdateTodo()
  const form = useAppForm({
    defaultValues: { text: todo.text },
    validators: { onChange: TodoFormSchema },
    onSubmit: async ({ value }) => {
      await editTodo(todo._id, { ...todo, ...value }, onSuccess)
      form.reset()
    },
  })

  return (
    <form onSubmit={handleSubmit(form)} className={cn('flex flex-col items-end gap-2', className)}>
      <form.AppField
        name="text"
        children={(field) => <field.TextField placeholder="Set the task name..." />}
      />
      <form.AppForm>
        <form.SubmitButton size="sm" className="w-full">
          Update Todo
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
