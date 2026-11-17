import { success } from '../../utils/api-response.js';
import { serializeUser } from '../../utils/serializers.js';
import { asyncHandler } from '../../utils/async-handler.js';
import * as authService from './auth.service.js';

export const login = asyncHandler(async (req, res) => {
  return success(res, await authService.login(req.body));
});

export const refresh = asyncHandler(async (req, res) => {
  return success(res, await authService.refresh(req.body.refreshToken));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  return success(res, null);
});

export const me = asyncHandler(async (req, res) => {
  return success(res, serializeUser(req.user));
});

