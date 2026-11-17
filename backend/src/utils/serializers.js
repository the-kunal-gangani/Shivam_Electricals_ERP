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
    email: user.email,
    phone: user.phone,
    role: user.role,
    storeIds: user.storeIds.map((store) => store.toString()),
    permissions: user.permissions
  };
  if (includeSensitive) result.isActive = user.isActive;
  return result;
}
