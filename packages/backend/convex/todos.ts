/** @format */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";

export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("todos")
      .withIndex("byCreatedBy", (q) => q.eq("created_by", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const newTodoId = await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
      created_by: user._id,
    });
    return await ctx.db.get(newTodoId);
  },
});

export const toggle = mutation({
  args: {
    id: v.id("todos"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    // todo: verify that the todo belongs to the user
    await ctx.db.patch(args.id, { completed: args.completed });
    return { success: true };
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);
    // todo: verify that the todo belongs to the user
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
