'use client'

import { cn } from '@/lib/utils'
import { useAddTodo } from '../hooks'
import { useAppForm } from '@workspace/form'
import z from 'zod/v4'

export function TodoForm({ className }: { className?: string }) {
  const addTodo = useAddTodo()

  const form = useAppForm({
    defaultValues: { title: '' },
    validators: { onChange: z.object({ title: z.string() }) },
    onSubmit: async ({ value }) => {
      await addTodo(value)
      form.reset()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center space-x-2', className)}>
      <form.AppField
        name="title"
        children={(field) => <field.TextField className="flex-1" placeholder="Add a new task..." />}
      />
      <form.AppForm>
        <form.SubmitButton>Add</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
