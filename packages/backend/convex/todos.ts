/** @format */

import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUserOrThrow } from './lib/auth'

export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)

    return await ctx.db
      .query('todos')
      .withIndex('byCreatedBy', (q) => q.eq('created_by', user._id))
      .collect()
  },
})

export const create = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const newTodoId = await ctx.db.insert('todos', {
      text: args.text,
      completed: false,
      created_by: user._id,
    })
    return await ctx.db.get(newTodoId)
  },
})

export const edit = mutation({
  args: {
    id: v.id('todos'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)
    await ctx.db.patch('todos', args.id, { text: args.text })
    return { success: true }
  },
})

export const toggle = mutation({
  args: {
    id: v.id('todos'),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)
    // todo: verify that the todo belongs to the user
    await ctx.db.patch('todos', args.id, { completed: args.completed })
    return { success: true }
  },
})

export const deleteTodo = mutation({
  args: {
    id: v.id('todos'),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx)
    // todo: verify that the todo belongs to the user
    await ctx.db.delete('todos', args.id)
    return { success: true }
  },
})

export const deleteCompletedTodo = mutation({

  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const todosList = await ctx.db
      .query('todos')
      .withIndex('byUserCompleted', (q) => q.eq('created_by', user._id).eq('completed', true)).collect()

    //check all todos from one specific user and delete all todoes completed
    return await Promise.all(todosList.map(t => ctx.db.delete('todos', t._id)))
  },
})
