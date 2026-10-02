'use client';

import React, { useState, useMemo } from 'react';
import { mockProducts } from '@/lib/mock-data';
import { Search, CheckCircle2, Save } from 'lucide-react';
import { Input, TablePagination, Button } from '@/components/ui';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Maintain local inventory state
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    mockProducts.forEach(product => {
      (product.variants || []).forEach(v => {
        initial[v.id] = v.stock_quantity;
      });
    });
    return initial;
  });

  // Flatten products into variants for inventory view
  const allInventoryItems: FlatInventoryItem[] = useMemo(() => {
    return mockProducts.flatMap(product => 
      (product.variants || []).map(variant => ({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        stock_quantity: stockMap[variant.id] ?? variant.stock_quantity,
        image: product.images?.[0]?.image_url
      }))
    ).filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === 'OUT') return item.stock_quantity === 0;
      if (statusFilter === 'LOW') return item.stock_quantity > 0 && item.stock_quantity < 5;
      return true;
    });
  }, [searchTerm, statusFilter, stockMap]);

  const paginatedInventoryItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allInventoryItems.slice(start, start + pageSize);
  }, [allInventoryItems, currentPage, pageSize]);

  const handleStockChange = (variantId: string, value: number) => {
    setStockMap(prev => ({
      ...prev,
      [variantId]: isNaN(value) ? 0 : Math.max(0, value),
    }));
  };

  const handleSaveStock = (variantId: string, productId: string, sku: string) => {
    const newQty = stockMap[variantId];
    if (newQty === undefined) return;

    // Mutate in mockProducts
    const product = mockProducts.find(p => p.id === productId);
    if (product && product.variants) {
      const v = product.variants.find(item => item.id === variantId);
      if (v) {
        v.stock_quantity = newQty;
      }
    }

    setFeedback(`Stock updated for ${sku} to ${newQty} units.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Inventory</h1>
          <p className="text-gray-500 text-sm">Manage live stock levels across variant SKUs (Table: `product_variants`).</p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-black text-white flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 size={18} className="text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search product name or SKU..."
              className="pl-9 h-10 rounded-none border-gray-300 w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                statusFilter === 'ALL' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Variants
            </button>
            <button
              onClick={() => { setStatusFilter('LOW'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                statusFilter === 'LOW' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Low Stock (&lt;5)
            </button>
            <button
              onClick={() => { setStatusFilter('OUT'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                statusFilter === 'OUT' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Out of Stock (0)
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Attributes</th>
                <th className="px-6 py-4 font-medium">Stock Quantity</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedInventoryItems.map((item) => (
                <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                        {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="font-bold text-black max-w-xs truncate">{item.productName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-semibold">{item.sku}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {item.size && <span className="mr-2">Size: <strong className="text-black">{item.size}</strong></span>}
                    {item.color && <span>Color: <strong className="text-black">{item.color}</strong></span>}
                  </td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      min="0"
                      value={item.stock_quantity}
                      onChange={(e) => handleStockChange(item.variantId, parseInt(e.target.value, 10))}
                      className="w-24 h-8 text-sm font-bold bg-white"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {item.stock_quantity === 0 ? (
                      <span className="px-2 py-1 text-xs font-bold bg-error/10 text-error">OUT OF STOCK</span>
                    ) : item.stock_quantity < 5 ? (
                      <span className="px-2 py-1 text-xs font-bold bg-warning/10 text-warning">LOW STOCK</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold bg-success/10 text-success">IN STOCK</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveStock(item.variantId, item.productId, item.sku)}
                      className="h-8 uppercase text-xs tracking-wider"
                    >
                      <Save className="mr-1 h-3.5 w-3.5" /> Save
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allInventoryItems.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No inventory items found.
            </div>
          )}
        </div>
        {allInventoryItems.length > 0 && (
          <TablePagination
            totalItems={allInventoryItems.length}
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
