import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'eggfarm',
  password: process.env.PGPASSWORD || 'yourpassword',
  port: process.env.PGPORT || 5432,
});

export default pool;