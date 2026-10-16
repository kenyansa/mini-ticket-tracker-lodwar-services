import rateLimit from "express-rate-limit";
import { config } from "../config";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { error: { message: "Too many attempts, try again later" } },
});