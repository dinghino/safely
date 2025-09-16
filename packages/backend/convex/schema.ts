import { defineSchema } from "convex/server";
import { users, todos } from "./schemas";

export default defineSchema({
  // Other tables here...
  users,
  todos,
});
