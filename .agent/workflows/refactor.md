---
description: Workflow for refactoring packages and integrating them as dependencies
---

# Refactoring & Integration Workflow

Use this workflow when moving code between packages or adding a package as a dependency to another (e.g., to the Convex backend).

## 📋 Steps
1. **Dependency Mapping**: Identify all existing consumers of the code to be refactored.
2. **Package Configuration**: 
   - Update `package.json` in the consumer package with `workspace:*`.
   - Ensure the provider package has correct `exports`.
3. **Refactoring**: 
   - Use `multi_replace_file_content` for cross-package imports/exports updates.
   - Maintain type safety throughout.
4. **Verification**:
   - Rely on the live dev environment (`bun dev`) for immediate feedback.
   - If importing into Convex backend, verify that `convex dev` successfully syncs and generates types.

## 💡 Monorepo Tips
- Check the root `package.json` for workspace patterns.
- Ensure `tsconfig.json` paths are aligned if using custom path aliases.
