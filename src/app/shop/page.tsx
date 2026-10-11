'use client';

import { useState, useMemo, useEffect } from 'react';
import { Container } from '@/components/ui';
import { ProductGrid, ProductFilters, SortSelect } from '@/components/product';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Product, Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    async function loadShopData() {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    }
    loadShopData();
  }, []);

  const handleToggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleToggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setInStockOnly(false);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category_id));
    }

    // Filter by price
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      result = result.filter(p => (p.sale_price ?? p.base_price) >= min);
    }
    if (!isNaN(max)) {
      result = result.filter(p => (p.sale_price ?? p.base_price) <= max);
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      result = result.filter(p =>
        p.variants?.some(v => selectedSizes.includes(v.size))
      );
    }

    // Filter by in-stock
    if (inStockOnly) {
      result = result.filter(p =>
        p.variants?.some(v => v.stock_quantity > 0)
      );
    }

    // Sort
    result.sort((a, b) => {
      const priceA = a.sale_price ?? a.base_price;
      const priceB = b.sale_price ?? b.base_price;

      if (sort === 'price-asc') return priceA - priceB;
      if (sort === 'price-desc') return priceB - priceA;
      if (sort === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [products, selectedCategories, minPrice, maxPrice, selectedSizes, inStockOnly, sort]);

  const filterProps = {
    categories,
    selectedCategories,
    onToggleCategory: handleToggleCategory,
    minPrice,
    maxPrice,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    selectedSizes,
    onToggleSize: handleToggleSize,
    inStockOnly,
    onToggleInStock: () => setInStockOnly(prev => !prev),
    onClear: handleClear,
  };

  return (
    <div className="py-6 md:py-10">
      <Container>
        {/* Breadcrumb */}
        <div className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray mb-4">
          <span className="hover:text-black transition-colors cursor-pointer">Home</span> <span className="mx-2 text-border font-normal">/</span> <span className="text-black">Shop</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3 pb-3 border-b border-border">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-1 text-black">All Products</h1>
            <p className="text-xs font-bold text-gray uppercase tracking-widest">{filteredProducts.length} Results</p>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="md:hidden flex-1">
              <ProductFilters {...filterProps} />
            </div>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block">
            <ProductFilters {...filterProps} />
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray">
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                Loading catalog...
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-16 border border-border bg-off-white/20">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-1">No matching products</h3>
                <p className="text-xs text-gray mb-4">Try adjusting your filters or price range.</p>
                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-dark transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
