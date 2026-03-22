import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import eggProductionRoutes from './routes/eggProduction.js';
import recordsRoutes from './routes/records.js';
import pool from './db.js';
import initDatabase from './init-db.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Route prefix: when running on Vercel serverless, requests are mounted under /api and
// the internal path seen by Express will typically not include the /api prefix.
// To support both local (dev) and Vercel (production) runtimes, set a prefix accordingly.
const routePrefix = process.env.VERCEL ? '' : '/api';

// Routes
app.use(`${routePrefix}/auth`, authRoutes);
app.use(`${routePrefix}/expenses`, expenseRoutes);
app.use(`${routePrefix}/egg-production`, eggProductionRoutes);
app.use(`${routePrefix}/records`, recordsRoutes);

// Health check endpoint
app.get(`${routePrefix}/health`, (req, res) => {
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Initialize database tables
    await initDatabase();

    // Start server (only start the HTTP listener when NOT running on Vercel serverless)
    if (!process.env.VERCEL) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📊 Excel file will be created as: data.xlsx`);
        console.log(`🔗 API Health Check: http://0.0.0.0:${PORT}/api/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

export async function logAudit({ userId, action, entity, entityId, details }) {
  await pool.query(
    'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
    [userId, action, entity, entityId, details ? JSON.stringify(details) : null]
  );
}
