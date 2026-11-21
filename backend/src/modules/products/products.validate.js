import { failure } from '../../utils/api-response.js';

function collect(result, errors) {
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    const key = issue.path.length ? issue.path.join('.') : 'body';
    if (!(key in errors)) errors[key] = issue.message;
  }

  return undefined;
}

export function validateRequest({ body, query, params }) {
  return (req, res, next) => {
    const errors = {};
    const validated = {};

    if (body) validated.body = collect(body.safeParse(req.body ?? {}), errors);
    if (query) validated.query = collect(query.safeParse(req.query), errors);
    if (params) validated.params = collect(params.safeParse(req.params), errors);

    if (Object.keys(errors).length > 0) {
      return failure(res, 'Please check the highlighted fields.', 422, errors);
    }

    req.validated = validated;
    return next();
  };
}
