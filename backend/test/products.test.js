import assert from 'node:assert/strict';
import test from 'node:test';
import { Permissions, Roles } from '../src/common/permissions.js';
import { serializeProduct, viewerOf } from '../src/modules/products/products.serializer.js';
import { diffRates, fromPaise, toPaise } from '../src/modules/products/products.utils.js';

test('product prices convert at the rupee boundary', () => {
  assert.equal(toPaise(90.5), 9050);
  assert.equal(fromPaise(9050), 90.5);
  assert.deepEqual(diffRates(
    { wholesalePaise: 8000, retailPaise: null, mrpPaise: 9000, costPaise: 7000 },
    { wholesaleRate: 95, retailRate: null }
  ), {
    set: { wholesalePaise: 9500 },
    changes: [{ field: 'wholesaleRate', oldPaise: 8000, newPaise: 9500 }]
  });
});

test('staff product serialization excludes protected prices', () => {
  const viewer = viewerOf({
    role: Roles.STAFF,
    permissions: [Permissions.VIEW_RETAIL_PRICE, Permissions.VIEW_COST_PRICE]
  });
  const product = serializeProduct({
    _id: 'product-id',
    brand: 'Brand',
    category: 'Switches',
    name: 'Sample',
    variants: [{
      _id: 'variant-id',
      label: 'Standard',
      isActive: true,
      reorderLevel: 0,
      wholesalePaise: 8000,
      retailPaise: 9000,
      mrpPaise: 10000,
      costPaise: 7000
    }]
  }, viewer);

  assert.equal(product.variants[0].wholesaleRate, 80);
  assert.equal('retailRate' in product.variants[0], false);
  assert.equal('mrp' in product.variants[0], false);
  assert.equal('costRate' in product.variants[0], false);
});
