'use client'

import Loader from '@/components/loader'
import { useDeleteTodo, useTodos, useToggleTodo } from '../hooks'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Button } from '@workspace/ui/components/button'
import { Trash2 } from 'lucide-react'
import type { Todo } from '../types'

export function TodosList() {
  const todos = useTodos()
  return (
    <>
      {todos === undefined ? (
        <div className="flex justify-center py-4">
          <Loader />
        </div>
      ) : todos.length === 0 ? (
        <p className="py-4 text-center">No todos yet. Add one!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItem key={todo._id} todo={todo} />
          ))}
        </ul>
      )}
    </>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()
  return (
    <li className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo._id, todo.completed)}
          id={`todo-${todo._id}`}
        />
        <label
          htmlFor={`todo-${todo._id}`}
          className={`${todo.completed ? 'text-muted-foreground line-through' : ''}`}
        >
          {todo.text}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteTodo(todo._id)}
        aria-label="Delete todo"
        className="cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  )
}
