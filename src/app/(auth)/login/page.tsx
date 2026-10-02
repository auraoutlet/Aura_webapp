'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdminNotice, setIsAdminNotice] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    justRegistered ? 'Account created successfully! Please sign in below.' : ''
  );

  // Auto redirect if already logged in
  useEffect(() => {
    async function checkExistingAuth() {
      // 1. Check if already logged in as admin
      const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('aura_admin_session=true');
      const hasAdminLocal = typeof window !== 'undefined' && localStorage.getItem('aura_admin_logged_in') === 'true';
      const roleLocal = typeof window !== 'undefined' && localStorage.getItem('aura_user_role');

      if (hasAdminCookie || hasAdminLocal || roleLocal === 'admin') {
        window.location.replace('/admin');
        return;
      }

      // 2. Check if logged in via Supabase
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'admin' || user.email === 'admin@auraoutlet.com') {
            document.cookie = 'aura_admin_session=true; path=/; max-age=604800; SameSite=Lax';
            document.cookie = 'aura_user_role=admin; path=/; max-age=604800; SameSite=Lax';
            localStorage.setItem('aura_admin_logged_in', 'true');
            localStorage.setItem('aura_user_role', 'admin');
            window.location.replace('/admin');
          } else {
            window.location.replace(redirectTarget === '/admin' ? '/account' : redirectTarget);
          }
        }
      } catch (e) {
        // Not logged in
      }
    }

    checkExistingAuth();
  }, [redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setIsAdminNotice(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    // 1. Check default admin credentials shortcut
    const isDefaultAdmin = cleanEmail === 'admin@auraoutlet.com' && cleanPassword === 'Auraoutlet@2026';

    if (isDefaultAdmin) {
      document.cookie = 'aura_admin_session=true; path=/; max-age=604800; SameSite=Lax';
      document.cookie = 'aura_user_role=admin; path=/; max-age=604800; SameSite=Lax';
      if (typeof window !== 'undefined') {
        localStorage.setItem('aura_admin_logged_in', 'true');
        localStorage.setItem('aura_user_role', 'admin');
        localStorage.setItem('aura_admin_email', cleanEmail);
      }

      // Also authenticate with Supabase in background
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
      } catch (e) {
        // Fallback session granted
      }

      setIsAdminNotice(true);
      setSuccessMessage('Administrator verified. Redirecting to Admin Dashboard...');
      setTimeout(() => {
        window.location.replace('/admin');
      }, 300);
      return;
    }

    // 2. Authenticate with Supabase Auth
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error || !data?.user) {
        setErrorMessage(error?.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // 3. Determine if the authenticated user is an Admin or Customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const isAdmin = profile?.role === 'admin' || data.user.email === 'admin@auraoutlet.com';

      if (isAdmin) {
        document.cookie = 'aura_admin_session=true; path=/; max-age=604800; SameSite=Lax';
        document.cookie = 'aura_user_role=admin; path=/; max-age=604800; SameSite=Lax';
        if (typeof window !== 'undefined') {
          localStorage.setItem('aura_admin_logged_in', 'true');
          localStorage.setItem('aura_user_role', 'admin');
          localStorage.setItem('aura_admin_email', cleanEmail);
        }

        setIsAdminNotice(true);
        setSuccessMessage('Administrator verified. Redirecting to Admin Dashboard...');
        setTimeout(() => {
          window.location.replace('/admin');
        }, 300);
      } else {
        // Customer session
        document.cookie = 'aura_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'aura_user_role=customer; path=/; max-age=604800; SameSite=Lax';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aura_admin_logged_in');
          localStorage.setItem('aura_user_role', 'customer');
          localStorage.removeItem('aura_admin_email');
        }

        setSuccessMessage('Signed in successfully! Redirecting...');
        const destination = redirectTarget === '/admin' ? '/account' : redirectTarget;
        setTimeout(() => {
          window.location.replace(destination);
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-wider uppercase text-black">Sign In</h1>
        <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-error/30 text-error text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-black text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          {isAdminNotice ? (
            <ShieldCheck size={16} className="shrink-0 text-white" />
          ) : (
            <CheckCircle2 size={16} className="shrink-0 text-white" />
          )}
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Email Address
          </label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="rounded-none h-12 text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-xs text-gray-500 hover:text-black transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="rounded-none h-12 text-sm pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 rounded-none bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs mt-2" 
          disabled={isLoading || !!successMessage}
        >
          {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
        Don&apos;t have an account?{' '}
        <Link 
          href={`/register${redirectTarget !== '/account' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
          className="font-bold text-black hover:underline ml-1 uppercase text-xs tracking-wider"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs uppercase tracking-widest text-gray-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
