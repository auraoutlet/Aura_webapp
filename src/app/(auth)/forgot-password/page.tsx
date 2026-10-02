'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate api call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-wider uppercase">Forgot Password</h1>
        <p className="text-gray-500">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 bg-gray-50 border border-gray-200 text-center space-y-4">
          <p className="font-medium">Reset link sent!</p>
          <p className="text-sm text-gray-600">
            Check your email for instructions to reset your password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
