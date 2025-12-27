import pool from '../db.js';

export async function logAudit({ userId, action, entity, entityId, details }) {
  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
    [userId, action, entity, entityId, details ? JSON.stringify(details) : null]
  );
}
