import { Router } from 'express';
import { Permissions } from '../../common/permissions.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { requireAnyPermission } from '../../middleware/any-permission.js';
import * as controller from './products.controller.js';
import {
  addVariantSchema,
  bulkRatesSchema,
  createProductSchema,
  historyQuerySchema,
  idParamsSchema,
  listQuerySchema,
  updateProductSchema,
  updateRatesSchema,
  variantParamsSchema
} from './products.schemas.js';
import { validateRequest } from './products.validate.js';

export const productsRouter = Router();

const canRead = requireAnyPermission(
  Permissions.VIEW_STOCK,
  Permissions.CREATE_WHOLESALE_BILL,
  Permissions.CREATE_DRAFT_BILL,
  Permissions.MANAGE_PRODUCTS
);
const canManage = requirePermission(Permissions.MANAGE_PRODUCTS);

productsRouter.use(requireAuth);

productsRouter.get('/', canRead, validateRequest({ query: listQuerySchema }), controller.listProducts);
productsRouter.get('/meta', canRead, controller.listMeta);

productsRouter.post(
  '/rates/bulk',
  canManage,
  validateRequest({ body: bulkRatesSchema }),
  controller.bulkUpdateRates
);

productsRouter.post(
  '/',
  canManage,
  validateRequest({ body: createProductSchema }),
  controller.createProduct
);

productsRouter.get('/:id', canRead, validateRequest({ params: idParamsSchema }), controller.getProduct);

productsRouter.patch(
  '/:id',
  canManage,
  validateRequest({ params: idParamsSchema, body: updateProductSchema }),
  controller.updateProduct
);

productsRouter.post(
  '/:id/variants',
  canManage,
  validateRequest({ params: idParamsSchema, body: addVariantSchema }),
  controller.addVariant
);

productsRouter.patch(
  '/:id/variants/:variantId/rates',
  canManage,
  validateRequest({ params: variantParamsSchema, body: updateRatesSchema }),
  controller.updateRates
);

productsRouter.get(
  '/:id/rate-history',
  canManage,
  validateRequest({ params: idParamsSchema, query: historyQuerySchema }),
  controller.listRateHistory
);
