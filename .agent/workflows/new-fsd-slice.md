---
description: Steps to create a new FSD slice (Feature, Entity, or Widget)
---

# New FSD Slice Workflow

Use this workflow when creating a new domain entity, feature, or widget in the web app.

## 📋 Steps

1. **Folder Setup**:
   - Create the directory using kebab-case in the appropriate layer (`apps/web/src/features/`, `entities/`, or `widgets/`).
   - Standard structure:
     - `components/`: UI components.
     - `hooks/`: Custom hooks.
     - `context/`: (Optional) React Context providers.
     - `index.ts`: Barrel export.

2. **Component Creation**:
   - Follow the **Namespaced Prop Types** and **Body Destructuring** rules in `code-style-guide.md`.
   - Use `packages/ui` components for base styling.

3. **Public API (index.ts)**:
   - **Expose Named Exports**: Export all reusable building blocks, hooks, and types.
   - **Default Export (Optional but Preferred)**: Use a default export for the "main interface" — the most common or fully-composed version of the slice (e.g., a pre-configured Widget).
   - This allows users to either grab the "ready-to-use" version or rebuild it ad-hoc using the named exports.

4. **Integration**:
   - Wire up the new slice in the appropriate page or parent component using the root index.
