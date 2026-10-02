import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import postgres from 'postgres';

async function createAdminUser() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1, ssl: 'require' });

  const adminEmail = 'admin@auraoutlet.com';
  const adminPassword = 'Auraoutlet@2026';

  console.log(`Setting up default admin account: ${adminEmail}...`);

  try {
    // 1. Enable pgcrypto
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

    // 2. Check if user already exists in auth.users
    const existing = await sql`
      SELECT id FROM auth.users WHERE email = ${adminEmail} LIMIT 1;
    `;

    let adminId: string;

    if (existing.length > 0) {
      adminId = existing[0].id;
      console.log(`User exists with id: ${adminId}. Updating password and confirmation...`);
      await sql`
        UPDATE auth.users
        SET 
          encrypted_password = crypt(${adminPassword}, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
          raw_user_meta_data = '{"full_name":"Admin User","role":"admin"}'::jsonb,
          updated_at = now()
        WHERE id = ${adminId};
      `;
    } else {
      console.log('Creating new admin user in auth.users...');
      const inserted = await sql`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${adminEmail},
          crypt(${adminPassword}, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
          '{"full_name":"Admin User","role":"admin"}'::jsonb,
          now(),
          now()
        )
        RETURNING id;
      `;
      adminId = inserted[0].id;
    }

    // 3. Upsert into public.profiles with role = 'admin'
    await sql`
      INSERT INTO public.profiles (
        id,
        full_name,
        role,
        updated_at
      ) VALUES (
        ${adminId},
        'Admin User',
        'admin',
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = 'Admin User',
        role = 'admin',
        updated_at = now();
    `;

    console.log(`✅ Default admin successfully set!`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await sql.end();
  }
}

createAdminUser();
