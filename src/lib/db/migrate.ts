import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in .env.local');
    console.log('\nPlease add your Supabase connection string to .env.local:');
    console.log('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.brfdzzkayfyivugydzen.supabase.co:5432/postgres\n');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL database...');
  const sql = postgres(connectionString, { 
    max: 1,
    ssl: 'require',
  });

  const db = drizzle(sql);

  console.log('⏳ Running Drizzle migrations from ./drizzle/migrations...');
  const start = Date.now();

  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    const elapsed = Date.now() - start;
    console.log(`✅ All migrations applied successfully in ${elapsed}ms!`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
