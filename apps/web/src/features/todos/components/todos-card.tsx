'use client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@workspace/ui/components/card'
import { CreateTodoForm } from './todo-form'
import { DeleteCompletedTodoButton, TodosList } from './todos-list'
import { Authenticated, Unauthenticated } from 'convex/react'

export function TodosCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
        <CardDescription>Manage your tasks efficiently</CardDescription>
      </CardHeader>
      <CardContent>
        <Authenticated>
          <div className="mb-2 inline-flex w-full items-center gap-2">
            <CreateTodoForm className="flex-1" />
            <DeleteCompletedTodoButton variant="destructive" />
          </div>
          <TodosList />
        </Authenticated>
        <Unauthenticated>
          <p className="py-4 text-center">Please log in to manage your todos.</p>
        </Unauthenticated>
      </CardContent>
    </Card>
  )
}
