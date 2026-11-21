import { failure } from '../utils/api-response.js';

export function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return failure(res, 'Authentication required.', 401);

    if (!permissions.some((permission) => req.user.permissions.includes(permission))) {
      return failure(res, 'You do not have permission to access this resource.', 403);
    }

    return next();
  };
}
