import { Store } from '../../models/store.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { success } from '../../utils/api-response.js';
import { serializeStore } from '../../utils/serializers.js';

export const listStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.storeIds },
    isActive: true
  }).sort({ name: 1 });
  return success(res, stores.map(serializeStore));
});

export const adminPing = asyncHandler(async (req, res) => {
  return success(res, { message: 'Admin route access confirmed.' });
});
