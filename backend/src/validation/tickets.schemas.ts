import { z } from "zod";

export const STATUSES = ["open", "in_progress", "closed"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;

export const statusSchema = z.enum(STATUSES);
export const prioritySchema = z.enum(PRIORITIES);

export const createTicketSchema = z.strictObject({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z.string().trim().max(5000).optional(),
  priority: prioritySchema.optional(),
});

export const listTicketsQuerySchema = z.object({
  status: statusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type Status = z.infer<typeof statusSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;