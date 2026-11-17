import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import * as controller from './stores.controller.js';

export const storesRouter = Router();

storesRouter.get('/', requireAuth, controller.listStores);
storesRouter.get('/admin-ping', requireAuth, requireRole('admin'), controller.adminPing);
