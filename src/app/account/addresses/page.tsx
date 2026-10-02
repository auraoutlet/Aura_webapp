'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeading, Button, Badge, Input, EmptyState, Spinner } from '@/components/ui';
import { Plus, Edit2, Trash2, MapPin, Check } from 'lucide-react';
import { Address } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<Address>>({});

  const loadAddresses = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (!error && data) {
          setAddresses(data as Address[]);
        }
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenForm = (address?: Address) => {
    setFormError('');
    if (address) {
      setFormData(address);
      setEditingId(address.id);
    } else {
      setFormData({
        is_default: addresses.length === 0,
        user_id: userId || '',
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({});
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSaving(true);
    setFormError('');

    try {
      const supabase = createClient();

      if (formData.is_default && addresses.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      if (editingId) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: formData.full_name?.trim(),
            phone: formData.phone?.trim(),
            address_line_1: formData.address_line_1?.trim(),
            address_line_2: formData.address_line_2?.trim() || null,
            city: formData.city?.trim(),
            state: formData.state?.trim(),
            pincode: formData.pincode?.trim(),
            is_default: !!formData.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: userId,
            full_name: formData.full_name?.trim(),
            phone: formData.phone?.trim(),
            address_line_1: formData.address_line_1?.trim(),
            address_line_2: formData.address_line_2?.trim() || null,
            city: formData.city?.trim(),
            state: formData.state?.trim(),
            pincode: formData.pincode?.trim(),
            is_default: !!formData.is_default || addresses.length === 0,
          });

        if (error) throw error;
      }

      await loadAddresses();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!userId) return;
    try {
      const supabase = createClient();
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      await loadAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-border p-8 min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 md:p-8 min-h-[500px]">
      <div className="flex justify-between items-center mb-8">
        <SectionHeading title="MY ADDRESSES" align="left" className="mb-0" />
        {!isFormOpen && (
          <Button onClick={() => handleOpenForm()} className="gap-2 font-bold text-xs uppercase tracking-wider">
            <Plus size={16} />
            ADD NEW ADDRESS
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="border border-border p-6 max-w-2xl bg-off-white/20 mb-8 space-y-5 animate-fade-in">
          <h3 className="font-bold text-base uppercase tracking-wider text-black">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>

          {formError && (
            <div className="p-3 bg-red-50 border border-error/30 text-error text-xs font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              value={formData.full_name || ''} 
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
              required 
            />
            <Input 
              label="Phone Number" 
              value={formData.phone || ''} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              required 
            />
            <div className="md:col-span-2">
              <Input 
                label="Address Line 1" 
                value={formData.address_line_1 || ''} 
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })} 
                required 
              />
            </div>
            <div className="md:col-span-2">
              <Input 
                label="Address Line 2 (Optional)" 
                value={formData.address_line_2 || ''} 
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })} 
              />
            </div>
            <Input 
              label="City" 
              value={formData.city || ''} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
              required 
            />
            <Input 
              label="State" 
              value={formData.state || ''} 
              onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
              required 
            />
            <Input 
              label="Pincode" 
              value={formData.pincode || ''} 
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} 
              required 
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="is_default" 
              checked={!!formData.is_default} 
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })} 
              className="w-4 h-4 accent-black cursor-pointer"
            />
            <label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleCloseForm} disabled={isSaving}>
              CANCEL
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'SAVING...' : 'SAVE ADDRESS'}
            </Button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 && !isFormOpen ? (
        <EmptyState 
          icon={MapPin}
          title="No Addresses Saved"
          description="You haven't saved any delivery addresses yet."
          actionLabel="ADD AN ADDRESS"
          onAction={() => handleOpenForm()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className="border border-border p-6 flex flex-col justify-between hover:border-black transition-colors bg-white relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-black">{address.full_name}</h3>
                  {address.is_default && (
                    <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase">DEFAULT</Badge>
                  )}
                </div>

                <div className="text-sm text-gray space-y-1 mb-4">
                  <p className="text-black font-medium">{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>{address.city}, {address.state} {address.pincode}</p>
                  <p className="mt-2 text-black font-medium">Phone: {address.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-xs font-bold uppercase tracking-wider">
                {!address.is_default && (
                  <button 
                    onClick={() => handleSetDefault(address.id)}
                    className="text-black hover:underline"
                  >
                    Set as default
                  </button>
                )}
                {address.is_default && <span className="text-gray-400 font-normal">Default address</span>}

                <div className="flex items-center gap-3 ml-auto">
                  <button 
                    onClick={() => handleOpenForm(address)}
                    className="p-1 hover:text-black text-gray transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="p-1 hover:text-error text-gray transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
