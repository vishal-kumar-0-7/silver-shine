import pool from '../db.js';

function isUUID(val) {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}

export async function logAudit({ userId, action, entity, entityId, details }) {
  // Only insert UUIDs into UUID columns; otherwise use NULL for those fields.
  const safeUserId = isUUID(userId) ? userId : null;
  const safeEntityId = isUUID(entityId) ? entityId : null;

  try {
    await pool.query(
      'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [safeUserId, action, entity, safeEntityId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Audit log insert failed:', err.message, { userId, entityId, action, entity });
  }
}
