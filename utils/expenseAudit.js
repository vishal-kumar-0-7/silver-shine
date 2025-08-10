import pool from '../db.js';

export async function logExpenseAudit({ userId, action, expenseId, details }) {
  await pool.query(
    'INSERT INTO expense_audit_log (user_id, action, expense_id, details) VALUES ($1, $2, $3, $4)',
    [userId, action, expenseId, details ? JSON.stringify(details) : null]
  );
} 