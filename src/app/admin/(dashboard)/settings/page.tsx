'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { CheckCircle2, Shield, Truck, Store, Share2 } from 'lucide-react';

export default function AdminSettings() {
  const [storeName, setStoreName] = useState('AURA OUTLET');
  const [tagline, setTagline] = useState('Quality Meets Style | Heavyweight Streetwear');
  const [supportEmail, setSupportEmail] = useState('support@auraoutlet.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [storeCity, setStoreCity] = useState('Tirupur, Tamil Nadu');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [shippingFee, setShippingFee] = useState('99');
  const [returnDays, setReturnDays] = useState('7');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/aura.outlet._/');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setFeedback('Store settings saved successfully!');
      setTimeout(() => setFeedback(null), 3000);
    }, 400);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Settings</h1>
        <p className="text-gray-500 text-sm">Configure store identity, fulfillment rules, policies, and integrations.</p>
      </div>

      {feedback && (
        <div className="p-4 bg-black text-white flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 size={18} className="text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <Store className="h-5 w-5 text-black" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Store Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Name</label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline / Motto</label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Support Email</label>
              <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Phone (WhatsApp)</label>
              <Input type="tel" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Warehouse / Origin Location</label>
              <Input value={storeCity} onChange={(e) => setStoreCity(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Shipping & Policies */}
        <div className="bg-white border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <Truck className="h-5 w-5 text-black" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Shipping & Policy Thresholds</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Free Shipping Over (₹)</label>
              <Input 
                type="number" 
                min="0" 
                value={freeShippingThreshold} 
                onChange={(e) => setFreeShippingThreshold(e.target.value)} 
                required 
              />
              <span className="text-[11px] text-gray-500">Orders equal or above this get free delivery.</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Standard Delivery Fee (₹)</label>
              <Input 
                type="number" 
                min="0" 
                value={shippingFee} 
                onChange={(e) => setShippingFee(e.target.value)} 
                required 
              />
              <span className="text-[11px] text-gray-500">Charged on orders below free shipping threshold.</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Return Window (Days)</label>
              <Input 
                type="number" 
                min="1" 
                max="30" 
                value={returnDays} 
                onChange={(e) => setReturnDays(e.target.value)} 
                required 
              />
              <span className="text-[11px] text-gray-500">Doorstep returns & exchange policy.</span>
            </div>
          </div>
        </div>

        {/* Social Integrations */}
        <div className="bg-white border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <Share2 className="h-5 w-5 text-black" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Social Integrations</h2>
          </div>
          
          <div className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Official Instagram Account</label>
              <Input 
                type="url" 
                value={instagramUrl} 
                onChange={(e) => setInstagramUrl(e.target.value)} 
              />
              <span className="text-[11px] text-gray-500">Linked across the public footer and about page.</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" disabled={isSaving} className="uppercase text-xs tracking-wider min-w-[140px]">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
