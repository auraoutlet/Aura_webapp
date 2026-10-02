import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import postgres from 'postgres';

async function setupAuthTriggers() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1, ssl: 'require' });

  console.log('⚡ Setting up Auth auto-confirm and Profile sync triggers...');

  try {
    // 1. Auto-confirm emails trigger on auth.users (function in public schema)
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.email_confirmed_at IS NULL THEN
          NEW.email_confirmed_at := now();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS trigger_auto_confirm_new_user ON auth.users;
      CREATE TRIGGER trigger_auto_confirm_new_user
        BEFORE INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();
    `);
    console.log('✅ Auto-confirm trigger installed on auth.users.');

    // 2. Profile sync trigger on auth.users -> public.profiles
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        user_role_val public.user_role;
      BEGIN
        user_role_val := CASE 
          WHEN (NEW.raw_user_meta_data->>'role') = 'admin' OR (NEW.raw_app_meta_data->>'role') = 'admin' THEN 'admin'::public.user_role
          ELSE 'customer'::public.user_role
        END;

        INSERT INTO public.profiles (id, full_name, phone, role)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', 'Valued Customer'),
          NEW.raw_user_meta_data->>'phone',
          user_role_val
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
          phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
          updated_at = now();

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('✅ Profile sync trigger installed on auth.users.');

  } catch (err) {
    console.error('Error installing triggers:', err);
  } finally {
    await sql.end();
  }
}

setupAuthTriggers();
