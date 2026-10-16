import { z } from "zod";

export const ROLES = ["admin", "agent", "requester"] as const;
export const roleSchema = z.enum(ROLES);

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Invalid email address"));
// bcrypt only uses the first 72 bytes, so cap the length
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");
const nameSchema = z.string().trim().min(1, "Name is required").max(100);

export const registerSchema = z.strictObject({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.strictObject({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export const updateUserSchema = z
  .strictObject({
    role: roleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.isActive !== undefined, {
    message: "Provide at least one of: role, isActive",
  });

export const listUsersQuerySchema = z.object({
  assignable: z.enum(["true"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;