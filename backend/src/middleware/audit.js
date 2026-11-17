import { AuditLog } from '../models/audit-log.js';

export async function writeAuditLog({
  actorId,
  action,
  entity,
  entityId,
  storeId = null,
  metadata = {}
}) {
  await AuditLog.create({ actorId, action, entity, entityId, storeId, metadata });
}
