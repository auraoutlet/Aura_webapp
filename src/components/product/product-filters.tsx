'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategories } from '@/lib/services/categories';
import { Category } from '@/lib/types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export interface ProductFiltersProps {
  categories?: Category[];
  selectedCategories?: string[];
  onToggleCategory?: (id: string) => void;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (val: string) => void;
  onMaxPriceChange?: (val: string) => void;
  selectedSizes?: string[];
  onToggleSize?: (size: string) => void;
  inStockOnly?: boolean;
  onToggleInStock?: () => void;
  onClear?: () => void;
}

interface FilterContentProps extends ProductFiltersProps {
  onClose?: () => void;
  isMobile?: boolean;
}

function FilterContent({
  categories = [],
  selectedCategories = [],
  onToggleCategory,
  minPrice = '',
  maxPrice = '',
  onMinPriceChange,
  onMaxPriceChange,
  selectedSizes = [],
  onToggleSize,
  inStockOnly = false,
  onToggleInStock,
  onClear,
  onClose,
  isMobile = false,
}: FilterContentProps) {
  return (
    <div className="space-y-4 text-xs">
      {isMobile && (
        <div className="flex items-center justify-between lg:hidden mb-4 pb-2 border-b-2 border-black">
          <h2 className="text-base font-black uppercase tracking-wider text-black">Filters</h2>
          <button onClick={onClose} aria-label="Close filters" className="p-1 hover:text-gray transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-black uppercase mb-2 text-xs tracking-[0.18em] text-black pb-1 border-b border-border">Categories</h3>
          <div className="space-y-1.5 mt-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors group">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 accent-black border-black cursor-pointer"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => onToggleCategory?.(cat.id)}
                />
                <span className="text-xs font-medium text-black/80 group-hover:text-black">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="font-black uppercase mb-2 text-xs tracking-[0.18em] text-black pb-1 border-b border-border">Price (₹)</h3>
        <div className="flex items-center gap-2 mt-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => onMinPriceChange?.(e.target.value)}
            className="w-full p-2 border border-border text-xs font-semibold outline-none focus:border-black bg-white" 
          />
          <span className="text-gray font-bold">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => onMaxPriceChange?.(e.target.value)}
            className="w-full p-2 border border-border text-xs font-semibold outline-none focus:border-black bg-white" 
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-black uppercase mb-2 text-xs tracking-[0.18em] text-black pb-1 border-b border-border">Size</h3>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button 
                key={size} 
                onClick={() => onToggleSize?.(size)}
                className={cn(
                  "w-8 h-8 border text-xs font-bold uppercase transition-all",
                  isSelected
                    ? "border-black bg-black text-white shadow-sm"
                    : "border-border hover:border-black text-black bg-white"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-black uppercase mb-2 text-xs tracking-[0.18em] text-black pb-1 border-b border-border">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input 
            type="checkbox" 
            className="w-3.5 h-3.5 accent-black border-black cursor-pointer"
            checked={inStockOnly}
            onChange={() => onToggleInStock?.()}
          />
          <span className="text-xs font-medium text-black">In Stock Only</span>
        </label>
      </div>

      <Button 
        variant="outline" 
        className="w-full uppercase text-[11px] font-black tracking-widest h-9 mt-1" 
        onClick={onClear}
      >
        Clear Filters
      </Button>
    </div>
  );
}

export function ProductFilters(props: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(props.categories || []);
  const [internalCategories, setInternalCategories] = useState<string[]>([]);
  const [internalMinPrice, setInternalMinPrice] = useState('');
  const [internalMaxPrice, setInternalMaxPrice] = useState('');
  const [internalSizes, setInternalSizes] = useState<string[]>([]);
  const [internalInStock, setInternalInStock] = useState(false);

  useEffect(() => {
    if (props.categories && props.categories.length > 0) {
      setCategories(props.categories);
    } else if (!props.categories) {
      getCategories().then(data => {
        if (data && data.length > 0) setCategories(data);
      });
    }
  }, [props.categories]);

  const selectedCategories = props.selectedCategories !== undefined ? props.selectedCategories : internalCategories;
  const toggleCategory = props.onToggleCategory || ((id: string) => {
    setInternalCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  });

  const minPrice = props.minPrice !== undefined ? props.minPrice : internalMinPrice;
  const maxPrice = props.maxPrice !== undefined ? props.maxPrice : internalMaxPrice;
  const onMinPriceChange = props.onMinPriceChange || setInternalMinPrice;
  const onMaxPriceChange = props.onMaxPriceChange || setInternalMaxPrice;

  const selectedSizes = props.selectedSizes !== undefined ? props.selectedSizes : internalSizes;
  const toggleSize = props.onToggleSize || ((size: string) => {
    setInternalSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  });

  const inStockOnly = props.inStockOnly !== undefined ? props.inStockOnly : internalInStock;
  const toggleInStock = props.onToggleInStock || (() => setInternalInStock(prev => !prev));

  const handleClear = () => {
    if (props.onClear) {
      props.onClear();
    } else {
      setInternalCategories([]);
      setInternalMinPrice('');
      setInternalMaxPrice('');
      setInternalSizes([]);
      setInternalInStock(false);
    }
  };

  const filterProps = {
    categories,
    selectedCategories,
    onToggleCategory: toggleCategory,
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
    selectedSizes,
    onToggleSize: toggleSize,
    inStockOnly,
    onToggleInStock: toggleInStock,
    onClear: handleClear,
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="lg:hidden flex items-center justify-center gap-1.5 uppercase text-xs font-bold tracking-wider w-full md:w-auto h-9"
        onClick={() => setIsOpen(true)}
      >
        <Filter size={14} /> Filters
      </Button>

      {/* Mobile Slide-out */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white p-5 overflow-y-auto shadow-xl">
            <FilterContent 
              {...filterProps}
              onClose={() => setIsOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-52 shrink-0 bg-off-white/30 p-4 border border-border">
        <FilterContent {...filterProps} />
      </div>
    </>
  );
}
