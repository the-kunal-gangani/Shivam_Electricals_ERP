import { User } from '../models/user.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { failure } from '../utils/api-response.js';
import { effectivePermissions } from '../common/permissions.js';

export async function requireAuth(req, res, next) {
  const header = req.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return failure(res, 'Authentication required.', 401);
  }

  let payload;
  try {
    payload = verifyAccessToken(header.slice(7));
  } catch {
    return failure(res, 'Authentication required.', 401);
  }

  const user = await User.findOne({ _id: payload.sub, isActive: true });
  if (!user) return failure(res, 'Authentication required.', 401);
  user.permissions = effectivePermissions(user.role, user.permissions);
  req.user = user;
  return next();
}

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return failure(res, 'Authentication required.', 401);
    if (!permissions.every((permission) => req.user.permissions.includes(permission))) {
      return failure(res, 'You do not have permission to access this resource.', 403);
    }
    return next();
  };
}
