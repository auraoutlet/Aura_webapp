'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button, Input, TablePagination } from '@/components/ui';
import { getAllAdminProducts, deleteProductFromDb } from '@/lib/services/products';
import { Product } from '@/lib/types';

export default function AdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getAllAdminProducts();
    setProductsList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return productsList.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [productsList, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setProductsList(prev => prev.filter(p => p.id !== id));
      await deleteProductFromDb(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Products</h1>
          <p className="text-gray-500 text-sm">Manage your product catalog dynamically from Supabase database.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-black text-white hover:bg-gray-800 rounded-none uppercase text-xs tracking-wider">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-9 h-10 rounded-none border-gray-300 w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Total Products: <strong className="text-black font-bold">{filteredProducts.length}</strong>
          </span>
        </div>
        
        {/* Data Table with Horizontal Scroll */}
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="p-16 flex items-center justify-center gap-3 text-sm text-gray-500 font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-black" />
              Loading products from database...
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => {
                  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                            {product.images?.[0]?.image_url ? (
                              <img src={product.images[0].image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-black max-w-[240px] truncate" title={product.name}>
                              {product.name}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{product.category?.name || product.category_id}</td>
                      <td className="px-6 py-4">
                        <div className="font-black text-black">{formatPrice(product.sale_price || product.base_price)}</div>
                        {product.sale_price && (
                          <div className="text-xs text-gray-400 line-through">{formatPrice(product.base_price)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${totalStock < 10 ? (totalStock === 0 ? "text-error" : "text-warning") : "text-gray-700"}`}>
                          {totalStock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-none ${product.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
                          {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link 
                            href={`/admin/products/${product.id}`} 
                            className="inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors" 
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="inline-flex items-center justify-center h-8 w-8 text-error hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No products found matching "{searchTerm}"
          </div>
        ) : !loading && filteredProducts.length > 0 ? (
          <TablePagination
            totalItems={filteredProducts.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </div>
    </div>
  );
}
