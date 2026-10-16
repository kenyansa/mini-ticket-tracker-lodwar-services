import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/auth.schemas';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), auth.register);
router.post('/login', authLimiter, validateBody(loginSchema), auth.login);
router.post('/logout', auth.logout);
router.get('/me', requireAuth, auth.me);

export default router;
