import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import eggProductionRoutes from './routes/eggProduction.js';
import recordsRoutes from './routes/records.js';
import { Pool } from 'pg';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/egg-production', eggProductionRoutes);
app.use('/api/records', recordsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Egg Farm Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Excel file will be created as: data.xlsx`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
});

export default app;

export async function logAudit({ userId, action, entity, entityId, details }) {
  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
    [userId, action, entity, entityId, details ? JSON.stringify(details) : null]
  );
}