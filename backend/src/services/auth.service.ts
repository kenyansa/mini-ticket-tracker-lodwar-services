import * as bcrypt from "bcryptjs";
import { config } from "../config";
import { HttpError } from "../middleware/errorHandler";
import * as usersRepo from "../repositories/users.repo";
import type { AuthUser } from "../repositories/users.repo";

// compared against when the email is unknown, so response time doesn't reveal which emails exist
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", config.bcryptRounds);

export async function authenticate(email: string, password: string): Promise<AuthUser> {
  const creds = await usersRepo.findCredentialsByEmail(email);
  const matches = await bcrypt.compare(password, creds?.passwordHash ?? DUMMY_HASH);
  if (!creds || !creds.isActive || !matches) {
    throw new HttpError(401, "Invalid email or password");
  }
  return (await usersRepo.findAuthUserById(creds.id)) as AuthUser;
}