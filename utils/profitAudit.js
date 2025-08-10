import pool from '../db.js';

export async function logProfitAudit({ userId, action, profitId, details }) {
  await pool.query(
    'INSERT INTO profit_audit_log (user_id, action, profit_id, details) VALUES ($1, $2, $3, $4)',
    [userId, action, profitId, details ? JSON.stringify(details) : null]
  );
} 