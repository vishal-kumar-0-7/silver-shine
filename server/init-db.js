import pool from './db.js';

const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        entity VARCHAR(255) NOT NULL,
        entity_id VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create expenses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create egg_production table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS egg_production (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        date DATE NOT NULL,
        timestamp TIME NOT NULL,
        egg_count INTEGER NOT NULL,
        feed_consumed DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, timestamp)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('init-db.js')) {
  initDatabase()
    .then(() => {
      console.log('Database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

export default initDatabase;
