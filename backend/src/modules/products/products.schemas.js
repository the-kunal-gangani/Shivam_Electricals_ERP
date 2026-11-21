import { z } from 'zod';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const rupees = z
  .number()
  .min(0, 'Rate cannot be negative')
  .max(10000000, 'Rate is too large')
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
    'Use at most 2 decimal places'
  );

const optionalRate = rupees.nullable().optional();
const rateFields = {
  mrp: optionalRate,
  wholesaleRate: optionalRate,
  retailRate: optionalRate,
  costRate: optionalRate
};
const rateKeys = Object.keys(rateFields);
const hasAnyRate = (value) => rateKeys.some((key) => value[key] !== undefined);

const variantInput = z.object({
  label: z.string().trim().min(1, 'Enter a label').max(40).default('Standard'),
  reorderLevel: z.number().int().min(0).max(1000000).default(0),
  ...rateFields
});

export const idParamsSchema = z.object({ id: objectId });
export const variantParamsSchema = z.object({ id: objectId, variantId: objectId });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(60).optional(),
  category: z.string().trim().max(60).optional(),
  unpriced: z.enum(['true', 'false']).optional().transform((value) => value === 'true'),
  includeInactive: z.enum(['true', 'false']).optional().transform((value) => value === 'true')
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const createProductSchema = z.object({
  brand: z.string().trim().min(1, 'Enter a brand').max(60),
  series: z.string().trim().max(60).optional(),
  category: z.string().trim().min(1, 'Enter a category').max(60),
  name: z.string().trim().min(1, 'Enter a name').max(160),
  code: z.string().trim().max(40).optional(),
  hsn: z.string().trim().max(12).optional(),
  unit: z.string().trim().min(1).max(12).default('pcs'),
  packSize: z.number().int().min(1).max(100000).default(1),
  variants: z.array(variantInput).min(1).max(12).default([{ label: 'Standard', reorderLevel: 0 }])
});

export const updateProductSchema = z
  .object({
    brand: z.string().trim().min(1).max(60).optional(),
    series: z.string().trim().max(60).optional(),
    category: z.string().trim().min(1).max(60).optional(),
    name: z.string().trim().min(1).max(160).optional(),
    code: z.string().trim().max(40).optional(),
    hsn: z.string().trim().max(12).optional(),
    unit: z.string().trim().min(1).max(12).optional(),
    packSize: z.number().int().min(1).max(100000).optional(),
    isActive: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update' });

export const addVariantSchema = variantInput;

export const updateRatesSchema = z.object(rateFields).refine(hasAnyRate, {
  message: 'Send at least one rate to change',
  path: ['wholesaleRate']
});

export const bulkRatesSchema = z.object({
  entries: z
    .array(
      z
        .object({ productId: objectId, variantId: objectId, ...rateFields })
        .refine(hasAnyRate, {
          message: 'Send at least one rate to change',
          path: ['wholesaleRate']
        })
    )
    .min(1)
    .max(200)
});
