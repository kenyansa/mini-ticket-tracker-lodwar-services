import type { AuthUser } from "../repositories/users.repo";

export type Permission =
  | "ticket:create"
  | "ticket:read_all"
  | "ticket:update"
  | "ticket:assign"
  | "user:read"
  | "user:manage";

export const can = (user: AuthUser, permission: Permission) =>
  user.permissions.includes(permission);