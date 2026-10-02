'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { mockCoupons } from '@/lib/mock-data';
import { Plus, Edit2, Trash2, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button, Input, TablePagination, Select } from '@/components/ui';
import { Coupon } from '@/lib/types';
import { getAllCoupons, saveCouponToDb, deleteCouponFromDb } from '@/lib/services/coupons';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadCoupons = async () => {
    setLoading(true);
    const data = await getAllCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [minimumOrderValue, setMinimumOrderValue] = useState<string>('999');
  const [maximumDiscount, setMaximumDiscount] = useState<string>('500');
  const [usageLimit, setUsageLimit] = useState<string>('100');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return coupons.slice(start, start + pageSize);
  }, [coupons, currentPage, pageSize]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinimumOrderValue('999');
    setMaximumDiscount('500');
    setUsageLimit('100');
    setExpiresAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinimumOrderValue(coupon.minimum_order_value.toString());
    setMaximumDiscount(coupon.maximum_discount ? coupon.maximum_discount.toString() : '');
    setUsageLimit(coupon.usage_limit ? coupon.usage_limit.toString() : '');
    setExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : '');
    setIsActive(coupon.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    if (editingCoupon) {
      const updated: Coupon = {
        ...editingCoupon,
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order_value: Number(minimumOrderValue) || 0,
        maximum_discount: maximumDiscount ? Number(maximumDiscount) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: isActive,
      };

      await saveCouponToDb(updated);

      setCoupons(coupons.map(c => c.id === editingCoupon.id ? updated : c));
      setFeedback(`Coupon "${code.toUpperCase()}" updated successfully.`);
    } else {
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order_value: Number(minimumOrderValue) || 0,
        maximum_discount: maximumDiscount ? Number(maximumDiscount) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        used_count: 0,
        is_active: isActive,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        created_at: new Date().toISOString(),
      };

      await saveCouponToDb(newCoupon);

      setCoupons([newCoupon, ...coupons]);
      setFeedback(`Coupon "${code.toUpperCase()}" created successfully.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) {
      setCoupons(coupons.filter(c => c.id !== id));
      await deleteCouponFromDb(id);
      setFeedback(`Coupon "${couponCode}" deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Coupons</h1>
          <p className="text-gray-500 text-sm">Manage discount codes and promotions (Table: `coupons`).</p>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-black text-white hover:bg-gray-800 rounded-none uppercase text-xs tracking-wider"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {feedback && (
        <div className="p-4 bg-black text-white flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 size={18} className="text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[750px] text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Min Order</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Expiry</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-black font-mono tracking-wider">{coupon.code}</td>
                  <td className="px-6 py-4 text-gray-600 uppercase font-medium">{coupon.discount_type}</td>
                  <td className="px-6 py-4 font-black text-black">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ₹{coupon.minimum_order_value || 0}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {coupon.used_count} / {coupon.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-none ${coupon.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
                      {coupon.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(coupon)}
                        className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors" 
                        title="Edit Coupon"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-2 text-error hover:bg-red-50 rounded transition-colors" 
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No coupons found. Click "Add Coupon" to create one.
            </div>
          )}
        </div>
        {coupons.length > 0 && (
          <TablePagination
            totalItems={coupons.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-black shadow-2xl p-6 space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700">Coupon Code *</label>
                <Input
                  required
                  placeholder="e.g. FESTIVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700">Description (Optional)</label>
                <Input
                  placeholder="e.g. 10% off for festive season orders"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700">Discount Type</label>
                  <Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    options={[
                      { value: 'percentage', label: 'Percentage (%)' },
                      { value: 'fixed', label: 'Fixed Amount (₹)' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700">Discount Value *</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700">Min Order (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={minimumOrderValue}
                    onChange={(e) => setMinimumOrderValue(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700">Max Discount (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={maximumDiscount}
                    onChange={(e) => setMaximumDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700">Usage Limit</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700">Expiry Date</label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-none accent-black"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="text-xs font-bold uppercase">Active (Can be redeemed)</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="uppercase text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="uppercase text-xs"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
