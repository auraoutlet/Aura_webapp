'use client';

import React, { useState } from 'react';
import { mockCustomers } from '@/lib/mock-data';
import { SectionHeading, Button, Input, Container } from '@/components/ui';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState(mockCustomers[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="bg-white border border-border p-6 md:p-8">
      <SectionHeading title="MY PROFILE" align="left" className="mb-8" />

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-medium">
            {getInitials(user.full_name)}
          </div>
          <Button variant="outline">Change Avatar</Button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-lg">
          <Input 
            label="Full Name" 
            value={user.full_name} 
            onChange={(e) => setUser({ ...user, full_name: e.target.value })} 
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={user.email || ''} 
            disabled 
            readOnly 
          />
          <Input 
            label="Phone Number" 
            type="tel" 
            value={user.phone || ''} 
            onChange={(e) => setUser({ ...user, phone: e.target.value })} 
          />

          <div className="pt-4">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
