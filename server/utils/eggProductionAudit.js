import { logAudit } from './audit.js';

export async function logEggProductionAudit({ userId, action, eggProductionId, details }) {
  await logAudit({ userId, action, entity: 'egg_production', entityId: eggProductionId, details });
}
