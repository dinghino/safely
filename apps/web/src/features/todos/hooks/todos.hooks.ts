'use client'

import { api } from '@workspace/backend/api'
import type { Id } from '@workspace/backend/dataModel'
import { useMutation, useQuery } from 'convex/react'
import type { Todo } from '../types'

export function useTodos() {
  return useQuery(api.todos.getAll)
}

type CreateTodo = Pick<Todo, 'text'>

export function useAddTodo() {
  const createTodoMutation = useMutation(api.todos.create)

  return async ({ text: title }: CreateTodo, onSuccess?: () => void) => {
    const text = title.trim()
    if (!text) return
    await createTodoMutation({ text })
    onSuccess?.()
  }
}

type UpdateTodoData = Omit<Todo, '_id' | 'completed' | '_creationTime' | 'created_by'>

export function useUpdateTodo() {
  const editTodo = useMutation(api.todos.edit)
  return async (id: Id<'todos'>, data: UpdateTodoData, onSuccess?: () => void) => {
    if (!data.text.trim()) return
    await editTodo({ id, ...data })
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
