import { failure } from '../utils/api-response.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return failure(res, 'You do not have permission to access this resource.', 403);
    }
    return next();
  };
}
