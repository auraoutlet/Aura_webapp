'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle2, Save } from 'lucide-react';
import { Input, TablePagination, Button, Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';

interface FlatInventoryItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  image?: string;
}

export default function AdminInventory() {
  const [items, setItems] = useState<FlatInventoryItem[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadInventory = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          images:product_images(image_url),
          variants:product_variants(*)
        `)
        .order('name');

      if (!error && data) {
        const flat: FlatInventoryItem[] = [];
        const initialStock: Record<string, number> = {};

        data.forEach((p: any) => {
          (p.variants || []).forEach((v: any) => {
            flat.push({
              variantId: v.id,
              productId: p.id,
              productName: p.name,
              sku: v.sku,
              size: v.size,
              color: v.color,
              price: Number(v.price),
              stock_quantity: Number(v.stock_quantity || 0),
              image: p.images?.[0]?.image_url,
            });
            initialStock[v.id] = Number(v.stock_quantity || 0);
          });
        });

        setItems(flat);
        setStockMap(initialStock);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockChange = (variantId: string, val: string) => {
    const num = parseInt(val, 10);
    setStockMap(prev => ({
      ...prev,
      [variantId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handleSaveStock = async (variantId: string) => {
    const newStock = stockMap[variantId] ?? 0;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', variantId);

      if (error) throw error;

      setFeedback(`Stock updated successfully!`);
      setTimeout(() => setFeedback(null), 3000);
      await loadInventory();
    } catch (err: any) {
      setFeedback(`Error: ${err.message || 'Failed to update stock'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color.toLowerCase().includes(searchTerm.toLowerCase());

      const stock = stockMap[item.variantId] ?? item.stock_quantity;
      let matchesStatus = true;
      if (statusFilter === 'LOW') matchesStatus = stock > 0 && stock <= 5;
      if (statusFilter === 'OUT') matchesStatus = stock === 0;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter, stockMap]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Inventory</h1>
          <p className="text-gray-500 text-sm">Monitor and update product variant stock levels in real-time.</p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-black text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 size={16} className="shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by product, SKU, color..."
              className="pl-9 h-10 rounded-none border-gray-300 w-full text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {(['ALL', 'LOW', 'OUT'] as const).map(tab => (
              <Button
                key={tab}
                variant={statusFilter === tab ? 'primary' : 'outline'}
                size="sm"
                className="h-9 px-3 rounded-none font-bold text-xs uppercase tracking-wider whitespace-nowrap"
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
              >
                {tab === 'ALL' ? 'All Stock' : tab === 'LOW' ? 'Low Stock (≤ 5)' : 'Out of Stock (0)'}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[750px] text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Product Variant</th>
                <th className="px-6 py-4 font-bold">SKU</th>
                <th className="px-6 py-4 font-bold">Size / Color</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Current Stock</th>
                <th className="px-6 py-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedItems.map((item) => {
                const currentStock = stockMap[item.variantId] ?? item.stock_quantity;
                const isDirty = currentStock !== item.stock_quantity;

                return (
                  <tr key={item.variantId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 uppercase">ITEM</span>
                          )}
                        </div>
                        <div className="font-bold text-black max-w-[200px] truncate">{item.productName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{item.sku}</td>
                    <td className="px-6 py-4 text-black font-medium">
                      <span>{item.size}</span>
                      <span className="text-gray-400 mx-1.5">•</span>
                      <span>{item.color}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-black">{formatPrice(item.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-20 h-9 rounded-none border-gray-300 text-center font-bold text-sm"
                          value={currentStock}
                          onChange={(e) => handleStockChange(item.variantId, e.target.value)}
                        />
                        {currentStock === 0 ? (
                          <span className="text-[10px] uppercase font-bold text-error bg-red-50 px-1.5 py-0.5 border border-red-200">Out</span>
                        ) : currentStock <= 5 ? (
                          <span className="text-[10px] uppercase font-bold text-warning bg-amber-50 px-1.5 py-0.5 border border-amber-200">Low</span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-success bg-green-50 px-1.5 py-0.5 border border-green-200">In Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        disabled={!isDirty || isSaving}
                        onClick={() => handleSaveStock(item.variantId)}
                        className="h-8 px-3 rounded-none font-bold text-xs uppercase tracking-wider gap-1.5"
                      >
                        <Save size={13} />
                        Save
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No inventory items matching your filter.
          </div>
        ) : (
          <TablePagination
            totalItems={filteredItems.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}
