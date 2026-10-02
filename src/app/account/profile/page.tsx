'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeading, Button, Input } from '@/components/ui';
import { getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setEmail(user.email || '');

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            setFullName(profile.full_name || user.user_metadata?.full_name || '');
            setPhone(profile.phone || user.user_metadata?.phone || '');
          } else {
            setFullName(user.user_metadata?.full_name || '');
            setPhone(user.user_metadata?.phone || '');
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const supabase = createClient();

      // 1. Update Supabase public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 2. Update Supabase user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-border p-8 min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 md:p-8">
      <SectionHeading title="MY PROFILE" align="left" className="mb-8" />

      {successMessage && (
        <div className="mb-6 p-4 bg-black text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 size={16} className="shrink-0 text-white" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-error/30 text-error text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {getInitials(fullName || 'User')}
          </div>
          <div>
            <h3 className="font-bold text-lg">{fullName || 'Valued Customer'}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider">AURA OUTLET Member</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Full Name
            </label>
            <Input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              className="rounded-none h-12 text-sm"
              placeholder="Your Full Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Email Address (Fixed)
            </label>
            <Input 
              type="email" 
              value={email} 
              disabled 
              readOnly 
              className="rounded-none h-12 text-sm bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Phone Number
            </label>
            <Input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="rounded-none h-12 text-sm"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSaving}
              className="h-12 px-8 rounded-none font-bold uppercase tracking-widest text-xs"
            >
              {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
