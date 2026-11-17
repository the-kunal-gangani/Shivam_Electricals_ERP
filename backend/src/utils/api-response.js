export function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function failure(res, message, status = 400, errors) {
  const body = { success: false, message };
  if (errors && Object.keys(errors).length > 0) body.errors = errors;
  return res.status(status).json(body);
}
