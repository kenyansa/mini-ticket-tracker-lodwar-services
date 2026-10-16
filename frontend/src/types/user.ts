export type Permission =
  | "ticket:create"
  | "ticket:read_all"
  | "ticket:update"
  | "ticket:assign"
  | "user:read"
  | "user:manage";

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface User extends UserSummary {
  isActive: boolean;
  permissions: Permission[];
}