import { isValidObjectId } from 'mongoose';
import { Store } from '../models/store.js';
import { Roles } from '../common/permissions.js';
import { failure } from '../utils/api-response.js';

export async function resolveStore(req, res, next) {
  if (!req.user) return failure(res, 'Authentication required.', 401);

  const requested = req.get('X-Store-Id');
  if (!requested) {
    req.storeId = req.user.role === Roles.ADMIN ? null : (req.user.storeIds[0] ?? null);
    return next();
  }

  if (!isValidObjectId(requested)) return failure(res, 'Invalid store.', 400);

  if (req.user.role === Roles.ADMIN) {
    const exists = await Store.exists({ _id: requested, isActive: true });
    if (!exists) return failure(res, 'Store not found.', 404);
  } else if (!req.user.storeIds.some((id) => id.toString() === requested)) {
    return failure(res, 'You do not have permission to access this resource.', 403);
  }

  req.storeId = requested;
  return next();
}
