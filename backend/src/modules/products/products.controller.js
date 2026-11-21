import { asyncHandler } from '../../utils/async-handler.js';
import { failure, success } from '../../utils/api-response.js';
import * as service from './products.service.js';

function respond(res, result, status = 200) {
  if (result.error) {
    return failure(res, result.error.message, result.error.status, result.error.errors);
  }
  return success(res, result.data, status);
}

export const listProducts = asyncHandler(async (req, res) => {
  return respond(res, await service.listProducts(req.user, req.validated.query));
});

export const listMeta = asyncHandler(async (req, res) => {
  return respond(res, await service.listMeta());
});

export const getProduct = asyncHandler(async (req, res) => {
  return respond(res, await service.getProduct(req.user, req.validated.params.id));
});

export const createProduct = asyncHandler(async (req, res) => {
  return respond(res, await service.createProduct(req.user, req.validated.body), 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  return respond(
    res,
    await service.updateProduct(req.user, req.validated.params.id, req.validated.body)
  );
});

export const addVariant = asyncHandler(async (req, res) => {
  return respond(
    res,
    await service.addVariant(req.user, req.validated.params.id, req.validated.body),
    201
  );
});

export const updateRates = asyncHandler(async (req, res) => {
  const { id, variantId } = req.validated.params;
  return respond(res, await service.updateRates(req.user, id, variantId, req.validated.body));
});

export const bulkUpdateRates = asyncHandler(async (req, res) => {
  return respond(res, await service.bulkUpdateRates(req.user, req.validated.body.entries));
});

export const listRateHistory = asyncHandler(async (req, res) => {
  return respond(
    res,
    await service.listRateHistory(req.validated.params.id, req.validated.query)
  );
});
