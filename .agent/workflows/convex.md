---
description: Guidelines for Convex backend development
---

# Convex Workflow

Guidelines for interacting with the Convex backend in the `packages/backend` package. Keep in mind this is an **opinionated tRPC-like** setup.

## 🏗 Mental Model
- **Opinionated tRPC**: Think of Convex functions as tRPC procedures. They provide end-to-end type safety automatically.
- **Embedded Database**: Use `ctx.db` like an ORM directly within your functions.
- **Live Sync**: When `bun dev:server` (running `convex dev`) is active, any change to schemas or functions triggers:
    1. **Typegen**: Generates types for the client apps.
    2. **Build & Push**: Updates the live Convex instance immediately.

## 🏗 Interaction Rules
- **Schema Management**: Schemas are located in `packages/backend/convex/schemas/`. 
- **Database Access**: Prefer specific indexes for queries. Avoid full collection scans.
- **Procedures**: Export `query`, `mutation`, or `action` from your files. Use internal variants for cross-function calls where appropriate.

## ⌨️ Commands
// turbo
- `bun dev:setup`: Initialize a new Convex project.
- `bun dev:server`: Start the local Convex development environment.

## 💡 Tips
- Convex functions automatically sync on save when `convex dev` is running.
- Use `ctx.db` for standard operations. Check `packages/backend/convex/lib/` for common utilities.
