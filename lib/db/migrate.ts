import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from './drizzle'

async function runMigrations() {
  console.log('Running migrations...')

  await migrate(db, { migrationsFolder: './drizzle' })

  console.log('Migrations complete!')

  process.exit(0)
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})