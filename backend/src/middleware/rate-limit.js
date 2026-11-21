import rateLimit from 'express-rate-limit';

function limiter(windowMs, limit, message, skipSuccessfulRequests = false) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message, errors: {} }
  });
}

export const globalLimiter = limiter(
  60 * 1000,
  300,
  'Too many requests. Please slow down.'
);

export const loginLimiter = limiter(
  15 * 60 * 1000,
  10,
  'Too many failed attempts. Please try again in a few minutes.',
  true
);
