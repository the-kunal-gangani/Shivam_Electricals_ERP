import { AuditLog } from '../models/audit-log.js';

export async function writeAuditLog({
  actorId,
  action,
  entity,
  entityId,
  storeId = null,
  metadata = {},
  actorRole,
  before,
  after,
  ip,
  userAgent
}) {
  await AuditLog.create({ actorId, actorRole, action, entity, entityId, storeId, metadata, before, after, ip, userAgent });
}
