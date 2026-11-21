import { effectivePermissions } from '../common/permissions.js';

export function serializeStore(store) {
  return {
    id: store._id.toString(),
    name: store.name,
    code: store.code
  };
}

export function serializeUser(user, { includeSensitive = false } = {}) {
  const result = {
    id: user._id.toString(),
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role: user.role,
    storeIds: user.storeIds.map((store) => store.toString()),
    permissions: effectivePermissions(user.role, user.permissions)
  };
  if (includeSensitive) result.isActive = user.isActive;
  return result;
}

export function serializeManagedUser(user) {
  return {
    ...serializeUser(user),
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt ?? null
  };
}
