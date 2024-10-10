import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './drizzle';

async function runMigrations() {
  console.log('Starting migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1); // Exit with failure status
  } finally {
    process.exit(0); // Ensure the process exits after migration
  }
}

runMigrations();
