import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// For edge / serverless environments or long-lived connections
const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'require',
});

export const db = drizzle(client, { schema });
export { schema };
