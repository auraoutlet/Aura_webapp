'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-12 border border-border shadow-2xl">
        <div className="text-center mb-10">
          <img src="/logo-black.png" alt="AURA OUTLET" className="h-16 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-black tracking-widest text-black mb-1 uppercase">AURA OUTLET</h1>
          <h2 className="text-xs font-bold text-gray uppercase tracking-[0.25em]">Admin Portal</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input 
              type="email" 
              placeholder="Email Address" 
              required
              className="border-gray-300 focus:border-black rounded-none h-12"
              defaultValue="admin@auraoutlet.com"
            />
          </div>
          <div>
            <Input 
              type="password" 
              placeholder="Password" 
              required
              className="border-gray-300 focus:border-black rounded-none h-12"
              defaultValue="password123"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-none bg-black text-white hover:bg-gray-800 uppercase tracking-widest font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} AURA OUTLET. All rights reserved.
        </div>
      </div>
    </div>
  );
}
