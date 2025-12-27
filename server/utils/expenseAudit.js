import { logAudit } from './audit.js';

export async function logExpenseAudit({ userId, action, expenseId, details }) {
  await logAudit({ userId, action, entity: 'expense', entityId: expenseId, details });
}
