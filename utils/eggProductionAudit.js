import pool from '../db.js';

export async function logEggProductionAudit({ userId, action, eggProductionId, details }) {
  await pool.query(
    'INSERT INTO egg_production_audit_log (user_id, action, egg_production_id, details) VALUES ($1, $2, $3, $4)',
    [userId, action, eggProductionId, details ? JSON.stringify(details) : null]
  );
}