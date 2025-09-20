'use client'

import { useState } from 'react'
import { PencilIcon, Trash2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Button } from '@workspace/ui/components/button'
import Loader from '@/components/loader'

import { useDeleteTodo, useTodos, useToggleTodo } from '../hooks'
import type { Todo } from '../types'
import { EditTodoForm } from './todo-form'

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
  return (
    <li className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center space-x-2">
        <ToggleTodo todo={todo} />
        <label
          htmlFor={`todo-${todo._id}`}
          className={`${todo.completed ? 'text-muted-foreground line-through' : ''}`}
        >
          {todo.text}
        </label>
      </div>
      <div className="inline-flex gap-2">
        {!todo.completed && <EditTodoDialog todo={todo} />}
        <DeleteTodoButton todo={todo} />
      </div>
    </li>
  )
}

function ToggleTodo({ todo }: { todo: Todo }) {
  const toggleTodo = useToggleTodo()
  return (
    <Checkbox
      checked={todo.completed}
      onCheckedChange={() => toggleTodo(todo._id, todo.completed)}
      id={`todo-${todo._id}`}
    />
  )
}

function DeleteTodoButton({ todo }: { todo: Todo }) {
  const deleteTodo = useDeleteTodo()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => deleteTodo(todo._id)}
      aria-label="Delete todo"
      className="cursor-pointer"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

function EditTodoDialog({ todo }: { todo: Todo }) {
  const [open, SetOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={SetOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={todo.completed} onClick={() => SetOpen(true)}>
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
        </DialogHeader>
        <EditTodoForm todo={todo} onSuccess={() => SetOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
