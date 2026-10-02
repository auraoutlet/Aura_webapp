'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui';
import { ProductGrid } from '@/components/product';
import { getProducts } from '@/lib/services/products';
import { Product } from '@/lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const searchResults = query.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const popularProducts = products.filter(p => p.is_featured).slice(0, 4);
  const displayPopular = popularProducts.length > 0 ? popularProducts : products.slice(0, 4);

  return (
    <div className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-8 text-center">Search</h1>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Search products by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-border text-lg outline-none focus:border-black transition-colors"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={20} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-black" size={32} />
          </div>
        ) : query.trim() !== '' ? (
          <div>
            <p className="text-gray mb-6 text-sm uppercase tracking-wider">{searchResults.length} Results for &ldquo;{query}&rdquo;</p>
            {searchResults.length > 0 ? (
              <ProductGrid products={searchResults} />
            ) : (
              <div className="text-center py-20 border border-border">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-2">No results found</h2>
                <p className="text-gray">We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try another search term.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Popular Right Now</h2>
            <ProductGrid products={displayPopular} />
          </div>
        )}
      </Container>
    </div>
  );
}
