import { asyncHandler } from '../../utils/async-handler.js';
import { success } from '../../utils/api-response.js';
import * as service from './users.service.js';

const actorOf = (req) => ({ userId: req.user._id, ip: req.ip, userAgent: req.get('user-agent') });

export const createStaff = asyncHandler(async (req, res) => success(res, await service.createStaff(actorOf(req), req.body), 201));
export const listStaff = asyncHandler(async (req, res) => {
  const result = await service.listStaff(req.query);
  return success(res, { items: result.items, page: req.query.page, limit: req.query.limit, total: result.total });
});
export const updateStaff = asyncHandler(async (req, res) => success(res, await service.updateStaff(actorOf(req), req.params.id, req.body)));
export const resetStaffPassword = asyncHandler(async (req, res) => {
  await service.resetStaffPassword(actorOf(req), req.params.id, req.body.password);
  return success(res, null);
});
