'use client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@workspace/ui/components/card'
import { CreateTodoForm } from './todo-form'
import { TodosList } from './todos-list'
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
          <CreateTodoForm />
          <TodosList />
        </Authenticated>
        <Unauthenticated>
          <p className="py-4 text-center">Please log in to manage your todos.</p>
        </Unauthenticated>
      </CardContent>
    </Card>
  )
}
