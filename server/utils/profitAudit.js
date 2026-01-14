import { logAudit } from './audit.js';

export async function logProfitAudit({ userId, action, profitId, details }) {
  await logAudit({ userId, action, entity: 'profit', entityId: profitId, details });
}
