'use client';

import { useState, useMemo, useEffect } from 'react';
import { Container } from '@/components/ui';
import { ProductGrid, ProductFilters, SortSelect } from '@/components/product';
import { getProducts } from '@/lib/services/products';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    async function loadShopProducts() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadShopProducts();
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
    <div className="py-12 md:py-20">
      <Container>
        {/* Breadcrumb */}
        <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray mb-8">
          <span className="hover:text-black transition-colors cursor-pointer">Home</span> <span className="mx-2 text-border font-normal">/</span> <span className="text-black">Shop</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-2 text-black">All Products</h1>
            <p className="text-sm md:text-base font-bold text-gray uppercase tracking-widest">{filteredProducts.length} Results</p>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="md:hidden flex-1">
              <ProductFilters {...filterProps} />
            </div>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <ProductFilters {...filterProps} />
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="p-20 flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-wider text-gray">
                <Loader2 className="h-5 w-5 animate-spin text-black" />
                Loading catalog...
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-20 border border-border">
                <h3 className="text-xl font-bold uppercase tracking-wider mb-2">No matching products</h3>
                <p className="text-gray mb-6">Try adjusting your filters or price range.</p>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-dark transition-colors"
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
