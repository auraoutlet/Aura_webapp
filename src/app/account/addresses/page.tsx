'use client';

import React, { useState } from 'react';
import { mockAddresses } from '@/lib/mock-data';
import { SectionHeading, Button, Badge, Input } from '@/components/ui';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Address } from '@/lib/types';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Address>>({});

  const handleOpenForm = (address?: Address) => {
    if (address) {
      setFormData(address);
      setEditingId(address.id);
    } else {
      setFormData({
        is_default: addresses.length === 0,
        user_id: 'user-1',
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: editingId || `addr-${Date.now()}`,
      user_id: formData.user_id || 'user-1',
      full_name: formData.full_name || '',
      phone: formData.phone || '',
      address_line_1: formData.address_line_1 || '',
      address_line_2: formData.address_line_2 || null,
      city: formData.city || '',
      state: formData.state || '',
      pincode: formData.pincode || '',
      landmark: formData.landmark || null,
      is_default: !!formData.is_default,
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newAddresses = [...addresses];

    if (newAddress.is_default) {
      newAddresses = newAddresses.map(a => ({ ...a, is_default: false }));
    }

    if (editingId) {
      newAddresses = newAddresses.map(a => a.id === editingId ? newAddress : a);
    } else {
      newAddresses.push(newAddress);
    }

    // Ensure at least one default if there are addresses
    if (newAddresses.length > 0 && !newAddresses.some(a => a.is_default)) {
      newAddresses[0].is_default = true;
    }

    setAddresses(newAddresses);
    handleCloseForm();
  };

  const handleDelete = (id: string) => {
    let newAddresses = addresses.filter(a => a.id !== id);
    if (newAddresses.length > 0 && !newAddresses.some(a => a.is_default)) {
      newAddresses[0].is_default = true;
    }
    setAddresses(newAddresses);
  };

  return (
    <div className="bg-white border border-border p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <SectionHeading title="MY ADDRESSES" align="left" />
        {!isFormOpen && (
          <Button variant="primary" onClick={() => handleOpenForm()} className="flex items-center gap-2">
            <Plus size={18} />
            ADD NEW ADDRESS
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <div className="border border-border p-6 bg-off-white mb-8">
          <h3 className="font-bold text-lg mb-6">{editingId ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name" 
                value={formData.full_name || ''} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                required 
              />
              <Input 
                label="Phone Number" 
                value={formData.phone || ''} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                required 
              />
            </div>
            
            <Input 
              label="Address Line 1" 
              value={formData.address_line_1 || ''} 
              onChange={(e) => setFormData({...formData, address_line_1: e.target.value})} 
              required 
            />
            <Input 
              label="Address Line 2 (Optional)" 
              value={formData.address_line_2 || ''} 
              onChange={(e) => setFormData({...formData, address_line_2: e.target.value})} 
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Input 
                label="City" 
                value={formData.city || ''} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                required 
              />
              <Input 
                label="State" 
                value={formData.state || ''} 
                onChange={(e) => setFormData({...formData, state: e.target.value})} 
                required 
              />
              <Input 
                label="Pincode" 
                value={formData.pincode || ''} 
                onChange={(e) => setFormData({...formData, pincode: e.target.value})} 
                required 
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-black" 
                checked={formData.is_default || false}
                onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
              />
              <span className="text-sm font-medium">Set as default address</span>
            </label>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
              <Button type="submit" variant="primary">SAVE ADDRESS</Button>
              <Button type="button" variant="outline" onClick={handleCloseForm}>CANCEL</Button>
            </div>
          </form>
        </div>
      ) : null}

      {!isFormOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="border border-border p-6 flex flex-col justify-between hover:border-black transition-colors">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="font-bold text-lg">{address.full_name}</span>
                  {address.is_default && <Badge variant="default">DEFAULT</Badge>}
                </div>
                <div className="text-sm text-gray leading-relaxed mb-6">
                  {address.address_line_1}<br />
                  {address.address_line_2 && <>{address.address_line_2}<br /></>}
                  {address.city}, {address.state} - {address.pincode}<br />
                  India<br />
                  Phone: {address.phone}
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-border">
                <button 
                  onClick={() => handleOpenForm(address)}
                  className="flex items-center gap-2 text-sm font-medium hover:text-black transition-colors"
                >
                  <Edit2 size={16} /> EDIT
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-2 text-sm font-medium text-error hover:opacity-80 transition-opacity ml-4"
                >
                  <Trash2 size={16} /> DELETE
                </button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray border border-dashed border-gray">
              No addresses found. Add one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
