import type { Doc } from "@workspace/backend/dataModel";

export type Device = Doc<'devices'> & { id: string }
