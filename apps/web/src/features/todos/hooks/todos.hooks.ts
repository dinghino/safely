'use client'

import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useMutation, useQuery } from 'convex/react'

export function useTodos() {
  return useQuery(api.todos.getAll)
}

export function useAddTodo() {
  const createTodoMutation = useMutation(api.todos.create)

  return async ({ title, onSuccess }: { title: string; onSuccess?: () => void }) => {
    const text = title.trim()
    if (!text) return
    await createTodoMutation({ text })
    onSuccess?.()
  }
}

export function useToggleTodo() {
  const toggleTodo = useMutation(api.todos.toggle)
  return (id: Id<'todos'>, current: boolean) => toggleTodo({ id, completed: !current })
}

export function useDeleteTodo() {
  const deleteTodo = useMutation(api.todos.deleteTodo)
  return (id: Id<'todos'>) => deleteTodo({ id })
}
