import * as bcrypt from "bcryptjs";
import { config } from "../config";
import { HttpError } from "../middleware/errorHandler";
import * as usersRepo from "../repositories/users.repo";
import type { AuthUser } from "../repositories/users.repo";
import type { CreateUserInput, UpdateUserInput } from "../validation/auth.schemas";

export async function createUser(input: CreateUserInput): Promise<AuthUser> {
  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);
  try {
    const id = await usersRepo.insert({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
    });
    return (await usersRepo.findAuthUserById(id)) as AuthUser;
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      throw new HttpError(409, "Email is already registered");
    }
    throw err;
  }
}

export function listUsers(assignableOnly: boolean) {
  return usersRepo.findAll(assignableOnly);
}

export async function updateUser(id: number, input: UpdateUserInput, actor: AuthUser) {
  if (id === actor.id) {
    throw new HttpError(400, "You cannot change your own role or active status");
  }
  const found = await usersRepo.update(id, input);
  if (!found) throw new HttpError(404, `User ${id} not found`);
  if (input.isActive === false) await usersRepo.deleteSessionsForUser(id);
  return (await usersRepo.findAuthUserById(id)) as AuthUser;
}