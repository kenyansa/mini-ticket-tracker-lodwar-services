import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { HttpError } from "./errorHandler";

export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new HttpError(400, "Validation failed", details));
    }
    req.body = result.data; // replace with the parsed, trimmed version
    next();
  };

export const validateQuery =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new HttpError(400, "Invalid query parameters", details));
    }
    res.locals.query = result.data;
    next();
  };