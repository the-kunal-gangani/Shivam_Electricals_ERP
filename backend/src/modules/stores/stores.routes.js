import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { resolveStore } from '../../middleware/store-context.js';
import * as controller from './stores.controller.js';

export const storesRouter = Router();

storesRouter.use(requireAuth, resolveStore);
storesRouter.get('/', controller.listStores);
storesRouter.get('/admin-ping', requireRole('admin'), controller.adminPing);
