import bcrypt from 'bcryptjs';
import { User } from '../../models/user.js';
import { Store } from '../../models/store.js';
import { env } from '../../config/env.js';
import { normalizePhone } from '../../utils/identifier.js';
import { defaultStaffPermissions, Roles } from '../../common/permissions.js';
import { writeAuditLog } from '../../middleware/audit.js';
import { revokeAllForUser } from '../auth/auth.service.js';
import { serializeManagedUser } from '../../utils/serializers.js';

const actorMeta = (actor) => ({ actorId: actor.userId, actorRole: Roles.ADMIN, ip: actor.ip, userAgent: actor.userAgent });

export async function createStaff(actor, input) {
  const phone = input.phone ? normalizePhone(input.phone) : undefined;
  if (input.phone && !phone) {
    const error = new Error('Enter a valid 10-digit mobile number.');
    error.statusCode = 422;
    throw error;
  }
  const store = await Store.findOne({ isActive: true }).sort({ createdAt: 1 });
  if (!store) {
    const error = new Error('No active store exists. Run the seed command first.');
    error.statusCode = 409;
    throw error;
  }
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone,
    passwordHash: await bcrypt.hash(input.password, env.BCRYPT_ROUNDS),
    role: Roles.STAFF,
    permissions: input.permissions ?? defaultStaffPermissions,
    storeIds: [store._id]
  });
  await writeAuditLog({ ...actorMeta(actor), action: 'user.create', entity: 'user', entityId: String(user._id), after: { name: user.name, email: user.email, phone: user.phone, permissions: user.permissions } });
  return serializeManagedUser(user);
}

export async function listStaff({ page, limit, search }) {
  const filter = { role: Roles.STAFF };
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  return { items: items.map(serializeManagedUser), total };
}

async function findStaff(id) {
  const user = await User.findOne({ _id: id, role: Roles.STAFF });
  if (!user) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

export async function updateStaff(actor, id, patch) {
  const user = await findStaff(id);
  const before = { name: user.name, permissions: user.permissions, isActive: user.isActive };
  Object.assign(user, patch);
  await user.save();
  if (patch.isActive === false) await revokeAllForUser(user._id);
  await writeAuditLog({ ...actorMeta(actor), action: 'user.update', entity: 'user', entityId: String(user._id), before, after: { name: user.name, permissions: user.permissions, isActive: user.isActive } });
  return serializeManagedUser(user);
}

export async function resetStaffPassword(actor, id, password) {
  const user = await findStaff(id);
  user.passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  await user.save();
  await revokeAllForUser(user._id);
  await writeAuditLog({ ...actorMeta(actor), action: 'user.reset_password', entity: 'user', entityId: String(user._id) });
}
