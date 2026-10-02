'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          window.location.href = redirectTarget;
        }
      } catch (e) {
        // Not logged in
      }
    }
    checkAuth();
  }, [redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      setIsLoading(false);
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            role: 'customer',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMessage('User creation failed. Please try a different email.');
        setIsLoading(false);
        return;
      }

      // Ensure profile record is synced
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: cleanName,
          phone: cleanPhone || null,
          role: 'customer',
        });
      } catch (profileErr) {
        // DB trigger handles this as well
      }

      setSuccessMessage('Account created successfully! Logging you in...');

      // If session is already created
      if (data.session) {
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 500);
        return;
      }

      // Otherwise attempt instant sign-in with the credentials
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (loginData?.session) {
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 500);
      } else {
        // Redirect to login page if email confirmation is enforced
        setTimeout(() => {
          window.location.href = `/login?registered=true&redirect=${encodeURIComponent(redirectTarget)}`;
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-wider uppercase text-black">Create Account</h1>
        <p className="text-gray-500 text-sm">Join AURA OUTLET for exclusive offers and faster checkout</p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-error/30 text-error text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-black text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 size={16} className="shrink-0 text-white" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Full Name
          </label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="rounded-none h-12 text-sm"
          />
        </div>

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
          <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Phone Number (Optional)
          </label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="+91 98765 43210" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            className="rounded-none h-12 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Password (min. 6 characters)
          </label>
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

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Confirm Password
          </label>
          <Input 
            id="confirmPassword" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="rounded-none h-12 text-sm"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 rounded-none bg-black text-white hover:bg-neutral-800 font-bold uppercase tracking-widest text-xs mt-2" 
          disabled={isLoading || !!successMessage}
        >
          {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
        Already have an account?{' '}
        <Link 
          href={`/login${redirectTarget !== '/account' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
          className="font-bold text-black hover:underline ml-1 uppercase text-xs tracking-wider"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs uppercase tracking-widest text-gray-400">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
