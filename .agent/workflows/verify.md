---
description: Verification workflow for changes
---

# Verification Workflow

How to ensure changes are correct before finalizing a task.

## ✅ Verification

1. **Visual/Live Check**: Rely on the running `bun dev` environment. If a browser subagent is needed, use it to check the live app on `http://localhost:3001`.
2. **Proactive Documentation**: If a change is complex, explain the rationale in the response.

## ⚠️ Notes

- **Linting & Commits**: The user manages linting, formatting, and commits. Do not run `bun check` or similar commands unless explicitly asked.
- **Full Builds**: Do not run `bun build` or `check-types` unless the user requires it for debugging a specific environment issue.
