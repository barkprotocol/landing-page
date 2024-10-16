import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create a new Pool instance for PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optionally, you can add error handling for pool events
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize Drizzle ORM with the PostgreSQL pool
export const db = drizzle(pool);

// Optionally, add a function to gracefully close the pool when your application exits
export async function closeDbConnection() {
  await pool.end();
  console.log('PostgreSQL connection pool closed.');
}
