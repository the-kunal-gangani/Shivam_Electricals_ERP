import { User } from '../models/user.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { failure } from '../utils/api-response.js';

export async function requireAuth(req, res, next) {
  const header = req.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return failure(res, 'Authentication required.', 401);
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findOne({ _id: payload.sub, isActive: true });
    if (!user) return failure(res, 'Authentication required.', 401);
    req.user = user;
    return next();
  } catch {
    return failure(res, 'Authentication required.', 401);
  }
}
