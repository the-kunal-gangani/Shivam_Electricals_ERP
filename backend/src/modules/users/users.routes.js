import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { Permissions } from '../../common/permissions.js';
import * as controller from './users.controller.js';
import { createStaffSchema, listStaffQuerySchema, resetPasswordSchema, updateStaffSchema } from './user.schemas.js';

export const usersRouter = Router();
usersRouter.use(requireAuth, requirePermission(Permissions.MANAGE_STAFF));
usersRouter.post('/staff', validate(createStaffSchema), controller.createStaff);
usersRouter.get('/staff', validate({ query: listStaffQuerySchema }), controller.listStaff);
const idParams = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id.') });
usersRouter.patch('/staff/:id', validate({ params: idParams, body: updateStaffSchema }), controller.updateStaff);
usersRouter.post('/staff/:id/reset-password', validate({ params: idParams, body: resetPasswordSchema }), controller.resetStaffPassword);
