import { failure } from '../utils/api-response.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path.join('.') || 'body', issue.message])
      );
      return failure(res, 'Validation failed.', 422, errors);
    }
    req.body = result.data;
    return next();
  };
}
