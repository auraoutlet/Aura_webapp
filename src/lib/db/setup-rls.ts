import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import postgres from 'postgres';

async function setupRLSAndGrants() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1, ssl: 'require' });

  console.log('🔐 Configuring PostgreSQL permissions and RLS policies for Supabase...');

  try {
    // 1. Grant table usage to anon and authenticated roles
    await sql`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;`;
    await sql`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;`;
    await sql`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;`;
    await sql`GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;`;

    // 2. Set default privileges for any future tables
    await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;`;
    await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;`;

    // 3. Enable RLS on public tables
    const tables = [
      'categories', 'products', 'product_variants', 'product_images', 
      'addresses', 'orders', 'order_items', 'payments', 'coupons', 
      'coupon_usages', 'wishlist_items', 'store_settings', 'profiles'
    ];

    for (const table of tables) {
      await sql.unsafe(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
      await sql.unsafe(`DROP POLICY IF EXISTS "Public Full Access" ON public."${table}";`);
      await sql.unsafe(`CREATE POLICY "Public Full Access" ON public."${table}" FOR ALL USING (true) WITH CHECK (true);`);
    }

    // 4. Setup storage buckets
    await sql`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('products', 'products', true), ('categories', 'categories', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `;

    await sql`
      DO $$ BEGIN
        DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
        CREATE POLICY "Public Access Products" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `;

    console.log('✅ Permissions and RLS policies successfully applied!');
  } catch (err) {
    console.error('Error applying grants:', err);
  } finally {
    await sql.end();
  }
}

setupRLSAndGrants();
