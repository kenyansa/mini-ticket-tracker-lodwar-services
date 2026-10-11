import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamsSchema,
  updateTicketSchema,
} from '../validation/tickets.schemas';

const router = Router();

router.post('/', validateBody(createTicketSchema), ticketsController.create);
router.get('/', validateQuery(listTicketsQuerySchema), ticketsController.list);
router.get('/stats', ticketsController.stats);

router.patch(
  '/:id',
  validateParams(ticketIdParamsSchema),
  validateBody(updateTicketSchema),
  ticketsController.update
);

export default router;
