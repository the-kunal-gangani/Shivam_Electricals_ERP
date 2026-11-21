import { effectivePermissions, Permissions } from '../../common/permissions.js';
import { fromPaise } from './products.utils.js';

export function viewerOf(user) {
  const held = new Set(effectivePermissions(user.role, user.permissions));
  return {
    canSeeRetail: held.has(Permissions.VIEW_RETAIL_PRICE),
    canSeeCost: held.has(Permissions.VIEW_COST_PRICE),
    canManage: held.has(Permissions.MANAGE_PRODUCTS)
  };
}

export function productSelect(viewer) {
  const hidden = [];
  if (!viewer.canSeeRetail) hidden.push('variants.retailPaise', 'variants.mrpPaise');
  if (!viewer.canSeeCost) hidden.push('variants.costPaise');
  return hidden.map((field) => `-${field}`).join(' ');
}

function serializeVariant(variant, viewer) {
  const out = {
    id: String(variant._id),
    label: variant.label,
    isActive: variant.isActive,
    reorderLevel: variant.reorderLevel ?? 0,
    wholesaleRate: fromPaise(variant.wholesalePaise),
    rateSet: variant.wholesalePaise !== null && variant.wholesalePaise !== undefined
  };

  if (viewer.canSeeRetail) {
    out.retailRate = fromPaise(variant.retailPaise);
    out.mrp = fromPaise(variant.mrpPaise);
  }
  if (viewer.canSeeCost) out.costRate = fromPaise(variant.costPaise);

  return out;
}

export function serializeProduct(product, viewer) {
  return {
    id: String(product._id),
    brand: product.brand,
    series: product.series ?? null,
    category: product.category,
    name: product.name,
    code: product.code ?? null,
    hsn: product.hsn ?? null,
    unit: product.unit,
    packSize: product.packSize,
    isActive: product.isActive,
    variants: product.variants.map((variant) => serializeVariant(variant, viewer))
  };
}

export function serializeHistory(entry) {
  return {
    id: String(entry._id),
    variantId: String(entry.variantId),
    field: entry.field,
    from: fromPaise(entry.oldPaise),
    to: fromPaise(entry.newPaise),
    changedBy: String(entry.changedBy),
    source: entry.source,
    createdAt: entry.createdAt
  };
}
