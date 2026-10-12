'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Layers, 
  ArrowRight,
  Shirt,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Input, TablePagination, Button, Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { SIZES } from '@/lib/constants';

interface BlankStock {
  black: Record<string, number>;
  white: Record<string, number>;
  updated_at: string;
}

const DEFAULT_BLANKS: BlankStock = {
  black: { XS: 25, S: 50, M: 75, L: 80, XL: 60, XXL: 30, '3XL': 15 },
  white: { XS: 15, S: 30, M: 45, L: 50, XL: 35, XXL: 20, '3XL': 10 },
  updated_at: new Date().toISOString(),
};

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
  const [productsList, setProductsList] = useState<Array<{ id: string; name: string }>>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [colorFilter, setColorFilter] = useState<'ALL' | 'Black' | 'White'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Blank Base T-Shirt Master Inventory State
  const [blankStock, setBlankStock] = useState<BlankStock>(DEFAULT_BLANKS);
  const [isSavingBlanks, setIsSavingBlanks] = useState(false);

  // Add Variant Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductId, setNewProductId] = useState('');
  const [newSize, setNewSize] = useState<string>('M');
  const [newColor, setNewColor] = useState<string>('Black');
  const [newPrice, setNewPrice] = useState<string>('999');
  const [newStock, setNewStock] = useState<string>('20');
  const [newSku, setNewSku] = useState('');
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // Bulk Sync to Catalog from Blanks
  const [isSyncingBlanks, setIsSyncingBlanks] = useState(false);

  const loadInventory = async () => {
    try {
      const supabase = createClient();

      // 1. Load Products & Variants
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
        const pList: Array<{ id: string; name: string }> = [];

        data.forEach((p: any) => {
          pList.push({ id: p.id, name: p.name });
          (p.variants || []).forEach((v: any) => {
            flat.push({
              variantId: v.id,
              productId: p.id,
              productName: p.name,
              sku: v.sku || `${p.name.slice(0, 3).toUpperCase()}-${v.size}-${v.color.slice(0, 3).toUpperCase()}`,
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
        setProductsList(pList);
        if (pList.length > 0 && !newProductId) {
          setNewProductId(pList[0].id);
        }
      }

      // 2. Load Base Blank Inventory from site_settings
      const { data: blankData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'blank_tshirt_inventory')
        .maybeSingle();

      if (blankData?.value) {
        setBlankStock({
          black: { ...DEFAULT_BLANKS.black, ...(blankData.value.black || {}) },
          white: { ...DEFAULT_BLANKS.white, ...(blankData.value.white || {}) },
          updated_at: blankData.value.updated_at || new Date().toISOString(),
        });
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

  // Update Blank T-Shirt Count
  const handleBlankCountChange = (color: 'black' | 'white', size: string, val: string) => {
    const num = parseInt(val, 10);
    const count = isNaN(num) ? 0 : Math.max(0, num);
    setBlankStock(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        [size]: count,
      },
    }));
  };

  // Save Blank T-Shirt Inventory to Supabase
  const handleSaveBlankStock = async () => {
    setIsSavingBlanks(true);
    try {
      const supabase = createClient();
      const updated = {
        ...blankStock,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'blank_tshirt_inventory',
          value: updated,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setBlankStock(updated);
      setFeedback('Master Blank T-Shirt stock saved successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message || 'Failed to save blank stock'}`);
    } finally {
      setIsSavingBlanks(false);
    }
  };

  // Sync Master Blank counts across all product designs in the catalog
  const handleApplyBlanksToCatalog = async () => {
    if (!confirm('This will update the stock quantity of all Black & White variants across your entire product catalog to match the Master Blank inventory counts above. Continue?')) {
      return;
    }

    setIsSyncingBlanks(true);
    try {
      const supabase = createClient();
      let updatedCount = 0;

      for (const item of items) {
        const colorKey = item.color.toLowerCase() === 'white' ? 'white' : 'black';
        const targetStock = blankStock[colorKey]?.[item.size];

        if (targetStock !== undefined && targetStock !== item.stock_quantity) {
          await supabase
            .from('product_variants')
            .update({ stock_quantity: targetStock, updated_at: new Date().toISOString() })
            .eq('id', item.variantId);
          updatedCount++;
        }
      }

      setFeedback(`Synced master stock across ${updatedCount} catalog variants!`);
      setTimeout(() => setFeedback(null), 3500);
      await loadInventory();
    } catch (err: any) {
      setFeedback(`Error syncing blanks: ${err.message}`);
    } finally {
      setIsSyncingBlanks(false);
    }
  };

  // Row-level variant stock change
  const handleStockChange = (variantId: string, val: string) => {
    const num = parseInt(val, 10);
    setStockMap(prev => ({
      ...prev,
      [variantId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  // Save single variant stock
  const handleSaveStock = async (variantId: string) => {
    const newStockVal = stockMap[variantId] ?? 0;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStockVal, updated_at: new Date().toISOString() })
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

  // Delete variant
  const handleDeleteVariant = async (variantId: string, name: string, size: string, color: string) => {
    if (!confirm(`Are you sure you want to delete ${name} (${size} / ${color})?`)) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      setFeedback(`Variant removed.`);
      setTimeout(() => setFeedback(null), 2500);
      await loadInventory();
    } catch (err: any) {
      setFeedback(`Failed to delete variant: ${err.message}`);
    }
  };

  // Add new variant modal submit
  const handleAddNewVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductId) {
      alert('Please select a product');
      return;
    }

    setIsAddingVariant(true);
    try {
      const supabase = createClient();
      const selectedProd = productsList.find(p => p.id === newProductId);
      const generatedSku = newSku.trim() || 
        `${(selectedProd?.name || 'AURA').slice(0, 4).toUpperCase().replace(/\s+/g, '')}-${newSize}-${newColor.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const newVarId = `var_${newProductId}_${Date.now()}`;

      const { error } = await supabase
        .from('product_variants')
        .insert({
          id: newVarId,
          product_id: newProductId,
          size: newSize,
          color: newColor,
          sku: generatedSku,
          price: Number(newPrice) || 999,
          stock_quantity: Number(newStock) || 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setShowAddModal(false);
      setNewSku('');
      setFeedback('New variant added to inventory successfully!');
      setTimeout(() => setFeedback(null), 3000);
      await loadInventory();
    } catch (err: any) {
      alert(`Error creating variant: ${err.message}`);
    } finally {
      setIsAddingVariant(false);
    }
  };

  // Filtering
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

      let matchesColor = true;
      if (colorFilter !== 'ALL') {
        matchesColor = item.color.toLowerCase() === colorFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesColor;
    });
  }, [items, searchTerm, statusFilter, colorFilter, stockMap]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Totals for summary cards
  const totalBlackBlanks = useMemo(() => 
    Object.values(blankStock.black).reduce((a, b) => a + b, 0), [blankStock.black]);
  const totalWhiteBlanks = useMemo(() => 
    Object.values(blankStock.white).reduce((a, b) => a + b, 0), [blankStock.white]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-black">Inventory Management</h1>
          <p className="text-gray text-xs sm:text-sm">
            Manage blank heavyweight T-Shirt stock (Black & White) and variant allocations across designs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 text-xs font-bold uppercase tracking-wider gap-1.5"
          >
            <Plus size={14} /> Add Product Variant
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-black text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 size={16} className="shrink-0 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: MASTER BLANK T-SHIRT INVENTORY (Black & White Core Stock) */}
      {/* ========================================================================= */}
      <div className="border border-black bg-white p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-black" />
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                Master Blank Heavyweight T-Shirt Stock
              </h2>
            </div>
            <p className="text-[11px] text-gray mt-0.5">
              Since designs are printed on demand onto blank 240+ GSM cotton blanks, manage your physical raw stock here:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSyncingBlanks}
              onClick={handleApplyBlanksToCatalog}
              className="h-8 text-[11px] font-bold uppercase tracking-wider gap-1"
              title="Apply these stock numbers to all products in your catalog"
            >
              <RefreshCw size={12} className={isSyncingBlanks ? 'animate-spin' : ''} />
              {isSyncingBlanks ? 'Syncing...' : 'Sync To Catalog'}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSavingBlanks}
              onClick={handleSaveBlankStock}
              className="h-8 text-[11px] font-bold uppercase tracking-wider gap-1"
            >
              <Save size={12} />
              {isSavingBlanks ? 'Saving...' : 'Save Blank Stock'}
            </Button>
          </div>
        </div>

        {/* 2 Color Strips: Black & White */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* BLACK BLANKS */}
          <div className="border border-border bg-off-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-black border border-black inline-block rounded-full" />
                <span className="text-xs font-black uppercase tracking-wider text-black">Black Blanks (240+ GSM)</span>
              </div>
              <span className="text-xs font-bold text-black bg-white px-2 py-0.5 border border-border">
                Total: {totalBlackBlanks} pcs
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((sz) => (
                <div key={sz} className="bg-white p-2 border border-border text-center space-y-1">
                  <span className="text-[10px] font-black uppercase block text-gray">{sz}</span>
                  <input
                    type="number"
                    min="0"
                    value={blankStock.black[sz] ?? 0}
                    onChange={(e) => handleBlankCountChange('black', sz, e.target.value)}
                    className="w-full text-center font-bold text-xs border border-gray-300 focus:border-black p-1 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* WHITE BLANKS */}
          <div className="border border-border bg-off-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-white border border-gray-400 inline-block rounded-full" />
                <span className="text-xs font-black uppercase tracking-wider text-black">White Blanks (240+ GSM)</span>
              </div>
              <span className="text-xs font-bold text-black bg-white px-2 py-0.5 border border-border">
                Total: {totalWhiteBlanks} pcs
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((sz) => (
                <div key={sz} className="bg-white p-2 border border-border text-center space-y-1">
                  <span className="text-[10px] font-black uppercase block text-gray">{sz}</span>
                  <input
                    type="number"
                    min="0"
                    value={blankStock.white[sz] ?? 0}
                    onChange={(e) => handleBlankCountChange('white', sz, e.target.value)}
                    className="w-full text-center font-bold text-xs border border-gray-300 focus:border-black p-1 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PRODUCT-SPECIFIC VARIANT ALLOCATIONS */}
      {/* ========================================================================= */}
      <div className="bg-white border border-border">
        {/* Search, Filter & Tabs */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
            <Input
              type="text"
              placeholder="Search by product, SKU, color..."
              className="pl-9 h-9 rounded-none border-gray-300 w-full text-xs"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Color Filter */}
            <div className="flex items-center gap-1 border border-border p-0.5 bg-off-white text-xs">
              {(['ALL', 'Black', 'White'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setColorFilter(c); setCurrentPage(1); }}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                    colorFilter === c ? 'bg-black text-white' : 'text-gray hover:text-black'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Stock status tabs */}
            <div className="flex items-center gap-1">
              {(['ALL', 'LOW', 'OUT'] as const).map(tab => (
                <Button
                  key={tab}
                  variant={statusFilter === tab ? 'primary' : 'outline'}
                  size="sm"
                  className="h-8 px-2.5 rounded-none font-bold text-[11px] uppercase tracking-wider"
                  onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                >
                  {tab === 'ALL' ? 'All' : tab === 'LOW' ? 'Low (≤ 5)' : 'Out of Stock (0)'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Variants Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[750px] text-left text-xs whitespace-nowrap">
            <thead className="bg-off-white text-gray uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3 font-bold">Product Variant</th>
                <th className="px-5 py-3 font-bold">SKU</th>
                <th className="px-5 py-3 font-bold">Size / Color</th>
                <th className="px-5 py-3 font-bold">Price</th>
                <th className="px-5 py-3 font-bold">Current Stock</th>
                <th className="px-5 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((item) => {
                const currentStock = stockMap[item.variantId] ?? item.stock_quantity;
                const isDirty = currentStock !== item.stock_quantity;

                return (
                  <tr key={item.variantId} className="hover:bg-off-white/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-off-white border border-border shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-gray uppercase">AO</span>
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/admin/products/${item.productId}`} 
                            className="font-bold text-black max-w-[200px] truncate block hover:underline"
                          >
                            {item.productName}
                          </Link>
                          <span className="text-[10px] text-gray">ID: {item.productId.slice(0, 10)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-gray">{item.sku}</td>
                    <td className="px-5 py-3 text-black font-semibold">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-bold mr-1.5">
                        {item.size}
                      </span>
                      <span>{item.color}</span>
                    </td>
                    <td className="px-5 py-3 font-bold text-black">{formatPrice(item.price)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-20 h-8 rounded-none border-gray-300 text-center font-bold text-xs"
                          value={currentStock}
                          onChange={(e) => handleStockChange(item.variantId, e.target.value)}
                        />
                        {currentStock === 0 ? (
                          <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200">Out</span>
                        ) : currentStock <= 5 ? (
                          <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 border border-amber-200">Low</span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 px-1.5 py-0.5 border border-green-200">In Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          disabled={!isDirty || isSaving}
                          onClick={() => handleSaveStock(item.variantId)}
                          className="h-7 px-2.5 rounded-none font-bold text-[10px] uppercase tracking-wider gap-1"
                        >
                          <Save size={12} />
                          Save
                        </Button>
                        <Link href={`/admin/products/${item.productId}`}>
                          <button
                            type="button"
                            className="p-1.5 text-gray hover:text-black border border-transparent hover:border-border transition-colors"
                            title="Edit Product & Variants"
                          >
                            <Edit3 size={13} />
                          </button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(item.variantId, item.productName, item.size, item.color)}
                          className="p-1.5 text-gray hover:text-red-600 border border-transparent hover:border-red-200 transition-colors"
                          title="Delete Variant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray text-xs">
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

      {/* ========================================================================= */}
      {/* MODAL: ADD PRODUCT VARIANT TO INVENTORY */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-black" />
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Add Variant to Inventory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray hover:text-black p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNewVariant} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-black">
                  Select Product *
                </label>
                <select
                  required
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full h-9 px-2.5 border border-border bg-white text-xs font-semibold focus:border-black outline-none"
                >
                  {productsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Size *</label>
                  <select
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full h-9 px-2.5 border border-border bg-white text-xs font-bold focus:border-black outline-none"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'FREE'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Color *</label>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full h-9 px-2.5 border border-border bg-white text-xs font-bold focus:border-black outline-none"
                  >
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Charcoal">Charcoal</option>
                    <option value="Off-White">Off-White</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Price (₹) *</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="999"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Stock Qty *</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-black">
                  SKU (Optional, auto-generated if blank)
                </label>
                <Input
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="h-9 text-xs font-mono"
                  placeholder="e.g. AURA-TEE-M-BLK"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs uppercase h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingVariant}
                  className="text-xs uppercase h-9 px-4 font-bold tracking-wider"
                >
                  {isAddingVariant ? 'Adding...' : 'Add Variant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
