import mongoose from 'mongoose';
import { Product } from '../../models/product.js';
import { RateHistory } from '../../models/rate-history.js';
import { writeAuditLog } from '../../middleware/audit.js';
import {
  buildSearchText,
  diffRates,
  fail,
  positionalSet,
  searchClauses,
  toPaise
} from './products.utils.js';
import {
  productSelect,
  serializeHistory,
  serializeProduct,
  viewerOf
} from './products.serializer.js';

const SORT = { brand: 1, category: 1, name: 1, _id: 1 };

async function inTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

function variantDocFromInput(input) {
  return {
    label: input.label,
    reorderLevel: input.reorderLevel ?? 0,
    mrpPaise: input.mrp === undefined || input.mrp === null ? null : toPaise(input.mrp),
    wholesalePaise:
      input.wholesaleRate === undefined || input.wholesaleRate === null
        ? null
        : toPaise(input.wholesaleRate),
    retailPaise:
      input.retailRate === undefined || input.retailRate === null
        ? null
        : toPaise(input.retailRate),
    costPaise:
      input.costRate === undefined || input.costRate === null
        ? null
        : toPaise(input.costRate)
  };
}

function hasDuplicateLabels(labels) {
  const seen = new Set();
  for (const label of labels) {
    const key = label.trim().toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

async function auditRateChanges(user, productId, changes, source) {
  if (changes.length === 0) return;
  await writeAuditLog({
    actorId: user._id,
    action: 'product.rate_change',
    entity: 'product',
    entityId: String(productId),
    metadata: { source, changes }
  });
}

export async function listProducts(user, query) {
  const viewer = viewerOf(user);
  const filter = {};

  if (!(viewer.canManage && query.includeInactive)) filter.isActive = true;
  if (query.brand) filter.brand = query.brand;
  if (query.category) filter.category = query.category;

  const clauses = searchClauses(query.search);
  if (clauses.length > 0) filter.$and = clauses;

  if (viewer.canManage && query.unpriced) {
    filter.variants = { $elemMatch: { wholesalePaise: null, isActive: true } };
  }

  const find = Product.find(filter)
    .sort(SORT)
    .skip((query.page - 1) * query.limit)
    .limit(query.limit);
  const select = productSelect(viewer);
  if (select) find.select(select);

  const [items, total] = await Promise.all([
    find.lean(),
    Product.countDocuments(filter)
  ]);

  return {
    data: {
      items: items.map((item) => serializeProduct(item, viewer)),
      page: query.page,
      limit: query.limit,
      total
    }
  };
}

export async function getProduct(user, id) {
  const viewer = viewerOf(user);
  const filter = viewer.canManage ? { _id: id } : { _id: id, isActive: true };
  const find = Product.findOne(filter);
  const select = productSelect(viewer);
  if (select) find.select(select);

  const product = await find.lean();
  if (!product) return fail(404, 'Product not found.');

  return { data: serializeProduct(product, viewer) };
}

export async function listMeta() {
  const [brands, categories] = await Promise.all([
    Product.distinct('brand', { isActive: true }),
    Product.distinct('category', { isActive: true })
  ]);

  return { data: { brands: brands.sort(), categories: categories.sort() } };
}

export async function createProduct(user, input) {
  if (hasDuplicateLabels(input.variants.map((variant) => variant.label))) {
    return fail(422, 'Variant labels must be different.', {
      variants: 'Duplicate variant label'
    });
  }

  const product = await Product.create({
    brand: input.brand,
    series: input.series,
    category: input.category,
    name: input.name,
    code: input.code,
    hsn: input.hsn,
    unit: input.unit,
    packSize: input.packSize,
    searchText: buildSearchText(input),
    variants: input.variants.map(variantDocFromInput)
  });

  return getProduct(user, String(product._id));
}

export async function updateProduct(user, id, patch) {
  const product = await Product.findById(id);
  if (!product) return fail(404, 'Product not found.');

  Object.assign(product, patch);
  await product.save();

  return getProduct(user, id);
}

export async function addVariant(user, id, input) {
  const product = await Product.findById(id);
  if (!product) return fail(404, 'Product not found.');

  const labels = [...product.variants.map((variant) => variant.label), input.label];
  if (hasDuplicateLabels(labels)) {
    return fail(422, 'A variant with this label already exists.', {
      label: 'Already exists'
    });
  }

  const doc = variantDocFromInput(input);
  product.variants.push(doc);
  await product.save();

  const added = product.variants[product.variants.length - 1];
  const changes = [
    ['mrp', doc.mrpPaise],
    ['wholesaleRate', doc.wholesalePaise],
    ['retailRate', doc.retailPaise],
    ['costRate', doc.costPaise]
  ]
    .filter(([, value]) => value !== null)
    .map(([field, value]) => ({
      productId: product._id,
      variantId: added._id,
      field,
      oldPaise: null,
      newPaise: value,
      changedBy: user._id,
      source: 'manual'
    }));

  if (changes.length > 0) {
    await RateHistory.insertMany(changes);
    await auditRateChanges(user, product._id, changes, 'manual');
  }

  return getProduct(user, id);
}

export async function updateRates(user, productId, variantId, patch) {
  const product = await Product.findById(productId).select('variants').lean();
  if (!product) return fail(404, 'Product not found.');

  const variant = product.variants.find((item) => String(item._id) === variantId);
  if (!variant) return fail(404, 'Variant not found.');

  const { set, changes } = diffRates(variant, patch);
  if (changes.length > 0) {
    await inTransaction(async (session) => {
      await Product.updateOne(
        { _id: productId, 'variants._id': variantId },
        { $set: positionalSet(set) },
        { session }
      );
      await RateHistory.insertMany(
        changes.map((change) => ({
          productId,
          variantId,
          field: change.field,
          oldPaise: change.oldPaise,
          newPaise: change.newPaise,
          changedBy: user._id,
          source: 'manual'
        })),
        { session }
      );
    });
    await auditRateChanges(user, productId, changes, 'manual');
  }

  return getProduct(user, productId);
}

export async function bulkUpdateRates(user, entries) {
  const ids = [...new Set(entries.map((entry) => entry.productId))];
  const products = await Product.find({ _id: { $in: ids } }).select('variants').lean();
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const operations = [];
  const history = [];
  const skipped = [];
  const seen = new Set();
  let unchanged = 0;

  for (const entry of entries) {
    const key = `${entry.productId}:${entry.variantId}`;
    if (seen.has(key)) {
      skipped.push({ productId: entry.productId, variantId: entry.variantId, reason: 'Duplicate entry' });
      continue;
    }
    seen.add(key);

    const product = byId.get(entry.productId);
    const variant = product?.variants.find((item) => String(item._id) === entry.variantId);
    if (!variant) {
      skipped.push({ productId: entry.productId, variantId: entry.variantId, reason: 'Product or variant not found' });
      continue;
    }

    const { set, changes } = diffRates(variant, entry);
    if (changes.length === 0) {
      unchanged += 1;
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: entry.productId, 'variants._id': entry.variantId },
        update: { $set: positionalSet(set) }
      }
    });

    history.push(
      ...changes.map((change) => ({
        productId: entry.productId,
        variantId: entry.variantId,
        field: change.field,
        oldPaise: change.oldPaise,
        newPaise: change.newPaise,
        changedBy: user._id,
        source: 'bulk'
      }))
    );
  }

  if (operations.length > 0) {
    await inTransaction(async (session) => {
      await Product.bulkWrite(operations, { session });
      await RateHistory.insertMany(history, { session });
    });
    await auditRateChanges(user, null, history, 'bulk');
  }

  return { data: { updated: operations.length, unchanged, skipped } };
}

export async function listRateHistory(productId, query) {
  const exists = await Product.exists({ _id: productId });
  if (!exists) return fail(404, 'Product not found.');

  const filter = { productId };
  const [items, total] = await Promise.all([
    RateHistory.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    RateHistory.countDocuments(filter)
  ]);

  return {
    data: {
      items: items.map(serializeHistory),
      page: query.page,
      limit: query.limit,
      total
    }
  };
}
