import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const connectionString = process.env.DATABASE_URL!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sql = postgres(connectionString, { max: 1, ssl: 'require' });
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdminUser() {
  const adminEmail = 'admin@auraoutlet.com';
  const adminPassword = 'Auraoutlet@2026';

  console.log('Re-creating admin account via official Supabase Auth...');

  try {
    // 1. Remove broken manual record if any
    const existing = await sql`SELECT id FROM auth.users WHERE email = ${adminEmail}`;
    if (existing.length > 0) {
      const id = existing[0].id;
      console.log('Removing old manual auth user:', id);
      await sql`DELETE FROM auth.identities WHERE user_id = ${id}`;
      await sql`DELETE FROM public.profiles WHERE id = ${id}`;
      await sql`DELETE FROM auth.users WHERE id = ${id}`;
      console.log('Old record cleaned up.');
    }

    // 2. Sign up properly via Supabase GoTrue Auth
    console.log('Signing up admin via Supabase Auth...');
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'Admin User',
          role: 'admin',
        },
      },
    });

    if (signUpErr) {
      console.error('Sign up error:', signUpErr);
      return;
    }

    const adminId = signUpData.user!.id;
    console.log('Admin user created successfully with ID:', adminId);

    // 3. Ensure role is 'admin' in profiles and app metadata
    await sql`
      UPDATE auth.users
      SET 
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
        raw_user_meta_data = '{"full_name":"Admin User","role":"admin"}'::jsonb
      WHERE id = ${adminId};
    `;

    await sql`
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (${adminId}, 'Admin User', 'admin')
      ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin User';
    `;

    // 4. Test signInWithPassword
    console.log('Verifying admin login...');
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (loginErr) {
      console.error('❌ Sign in failed:', loginErr.message);
    } else {
      console.log('🎉 PERFECT! Admin logged in via Supabase Auth! Token:', loginData.session?.access_token.slice(0, 30) + '...');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

fixAdminUser();
