import { Router } from "express";
import * as ticketsController from "../controllers/tickets.controller";
import { validateBody } from "../middleware/validate";
import { createTicketSchema } from "../validation/tickets.schemas";

const router = Router();

router.post("/", validateBody(createTicketSchema), ticketsController.create);

export default router;