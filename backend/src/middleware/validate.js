import { failure } from '../utils/api-response.js';

function setRequestProperty(req, key, value) {
  Object.defineProperty(req, key, { value, writable: true, configurable: true, enumerable: true });
}

export function validate(schemaOrSchemas) {
  const schemas = schemaOrSchemas.safeParse
    ? { body: schemaOrSchemas }
    : schemaOrSchemas;
  return (req, res, next) => {
    const errors = {};
    for (const [key, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[key]);
      if (result.success) {
        if (key === 'body') req.body = result.data;
        else setRequestProperty(req, key, result.data);
      } else {
        for (const issue of result.error.issues) {
          errors[issue.path.join('.') || key] ??= issue.message;
        }
      }
    }
    if (Object.keys(errors).length) return failure(res, 'Validation failed.', 422, errors);
    return next();
  };
}
