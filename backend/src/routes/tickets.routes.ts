import { Router } from "express";
import * as ticketsController from "../controllers/tickets.controller";
import { validateBody, validateQuery } from "../middleware/validate";
import { createTicketSchema, listTicketsQuerySchema } from "../validation/tickets.schemas";

const router = Router();

router.post("/", validateBody(createTicketSchema), ticketsController.create);
router.get("/", validateQuery(listTicketsQuerySchema), ticketsController.list);
export default router;