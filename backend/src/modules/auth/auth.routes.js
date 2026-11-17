import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import * as controller from './auth.controller.js';
import { loginSchema, logoutSchema, refreshSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), controller.login);
authRouter.post('/refresh', validate(refreshSchema), controller.refresh);
authRouter.post('/logout', validate(logoutSchema), controller.logout);
authRouter.get('/me', requireAuth, controller.me);
