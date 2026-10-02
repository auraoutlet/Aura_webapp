import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('--- 1. Testing Default Admin Login ---');
  const { data: adminLogin, error: adminErr } = await supabase.auth.signInWithPassword({
    email: 'admin@auraoutlet.com',
    password: 'Auraoutlet@2026',
  });

  if (adminErr) {
    console.error('❌ Admin login failed:', adminErr.message);
  } else {
    console.log('✅ Admin login succeeded! User ID:', adminLogin.user?.id);
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminLogin.user.id)
      .single();
    console.log('✅ Admin profile:', adminProfile);
  }

  console.log('\n--- 2. Testing Customer Registration ---');
  const testEmail = `testuser_${Date.now()}@auraoutlet.com`;
  const testPassword = 'Password@123';
  const testName = 'Test User';
  const testPhone = '+91 99999 88888';

  const { data: signupData, error: signupErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testName,
        phone: testPhone,
        role: 'customer',
      },
    },
  });

  if (signupErr) {
    console.error('❌ Customer signup failed:', signupErr.message);
  } else {
    console.log('✅ Customer signup succeeded! User ID:', signupData.user?.id);
    console.log('User confirmed?:', !!signupData.user?.email_confirmed_at);
    console.log('Session returned?:', !!signupData.session);

    // Check if profile was automatically created by trigger
    const { data: customerProfile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user!.id)
      .single();

    if (profErr) {
      console.log('Profile query error:', profErr.message);
    } else {
      console.log('✅ Customer profile automatically created:', customerProfile);
    }

    console.log('\n--- 3. Testing Customer Sign In ---');
    const { data: custLogin, error: custLoginErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (custLoginErr) {
      console.error('❌ Customer login failed:', custLoginErr.message);
    } else {
      console.log('✅ Customer login succeeded! Session token length:', custLogin.session?.access_token.length);
    }
  }
}

testAuth();
