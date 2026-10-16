import { Router } from 'express';
import * as users from '../controllers/users.controller';
import { requireAuth, requirePermission } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from '../validation/auth.schemas';
import { ticketIdParamsSchema } from '../validation/tickets.schemas';

const router = Router();
router.use(requireAuth);

router.get('/', requirePermission('user:read'), validateQuery(listUsersQuerySchema), users.list);
router.post('/', requirePermission('user:manage'), validateBody(createUserSchema), users.create);
router.patch(
  '/:id',
  requirePermission('user:manage'),
  validateParams(ticketIdParamsSchema), // same shape: a positive integer id
  validateBody(updateUserSchema),
  users.update
);

export default router;
