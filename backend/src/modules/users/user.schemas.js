import { z } from 'zod';
import { staffGrantablePermissions } from '../../common/permissions.js';

const permission = z.string().refine((value) => staffGrantablePermissions.includes(value), {
  message: 'Permission cannot be granted to staff.'
});

export const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().min(1).optional(),
  password: z.string().min(8).max(128),
  permissions: z.array(permission).max(staffGrantablePermissions.length).optional()
}).refine((value) => Boolean(value.email) || Boolean(value.phone), {
  message: 'Email or phone is required.',
  path: ['email']
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  permissions: z.array(permission).max(staffGrantablePermissions.length).optional(),
  isActive: z.boolean().optional()
}).refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update.' });

export const resetPasswordSchema = z.object({ password: z.string().min(8).max(128) });
export const listStaffQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(60).optional()
});
