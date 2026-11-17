import mongoose from 'mongoose';
import { failure } from '../utils/api-response.js';

export function notFound(req, res) {
  return failure(res, 'Route not found.', 404);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, detail.message])
    );
    return failure(res, 'Validation failed.', 422, errors);
  }

  if (error?.code === 11000) {
    return failure(res, 'A record with that value already exists.', 409);
  }

  if (process.env.NODE_ENV !== 'test') console.error(error);
  return failure(res, error.statusCode ? error.message : 'Something went wrong.', error.statusCode ?? 500);
}
