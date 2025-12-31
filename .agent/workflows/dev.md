---
description: General development workflow for Safely
---

# Development Workflow

Follow these guidelines for internal development within the `safely` monorepo.

## 🛠 Tooling

- **Package Manager**: Use `bun`.
- **Orchestration**: Use `turbo` for running scripts across apps/packages.
- **Linting/Formatting**: Use `biome`.

## 💻 Standard Commands

// turbo

- `bun dev:web`: Start the Next.js frontend (port 3001).
- `bun dev:server`: Start the Convex backend development server.

## 📏 Guidelines

- **Lean Verification**: Do NOT run `build` or `check-types` by default. The dev environment handles hot-reloading and live feedback.
- **Running scripts**: dev environment is usually running already. only confirm with the user and access it if needed. do not run `dev` by yourself.
- **File Naming**: Use kebab-case for all files and directories.
- **Verification**: The user manages linting and commits. Do not run `bun check`.
- **CSS**: use `cn` from `@/lib/utils` to merge css classes
- **CSS*: NEVER EVER add boundary margins that are not strictly required inside composable components. views, layouts and pages define spacing if needed (with exceptions of internal spacing)
