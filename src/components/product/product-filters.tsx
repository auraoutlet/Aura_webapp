'use client';

import React, { useState } from 'react';
import { mockFilterOptions } from '@/lib/mock-data';
import { Button } from '@/components/ui';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductFiltersProps {
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
    <div className="space-y-7">
      {isMobile && (
        <div className="flex items-center justify-between lg:hidden mb-6 pb-3 border-b-2 border-black">
          <h2 className="text-xl font-black uppercase tracking-wider text-black">Filters</h2>
          <button onClick={onClose} aria-label="Close filters" className="p-1 hover:text-gray transition-colors">
            <X size={22} />
          </button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-black uppercase mb-3 text-xs md:text-sm tracking-[0.2em] text-black pb-1.5 border-b border-border">Categories</h3>
        <div className="space-y-2.5 mt-3">
          {mockFilterOptions.categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer hover:text-black transition-colors group">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-black border-black cursor-pointer"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => onToggleCategory?.(cat.id)}
              />
              <span className="text-sm md:text-base font-medium text-black/80 group-hover:text-black">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-black uppercase mb-3 text-xs md:text-sm tracking-[0.2em] text-black pb-1.5 border-b border-border">Price (₹)</h3>
        <div className="flex items-center gap-2 mt-3">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => onMinPriceChange?.(e.target.value)}
            className="w-full p-2.5 border border-border text-sm font-semibold outline-none focus:border-black bg-white" 
          />
          <span className="text-gray font-bold">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => onMaxPriceChange?.(e.target.value)}
            className="w-full p-2.5 border border-border text-sm font-semibold outline-none focus:border-black bg-white" 
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-black uppercase mb-3 text-xs md:text-sm tracking-[0.2em] text-black pb-1.5 border-b border-border">Size</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {mockFilterOptions.sizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button 
                key={size} 
                onClick={() => onToggleSize?.(size)}
                className={cn(
                  "w-11 h-11 border text-xs md:text-sm font-extrabold uppercase transition-all",
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
        <h3 className="font-black uppercase mb-3 text-xs md:text-sm tracking-[0.2em] text-black pb-1.5 border-b border-border">Availability</h3>
        <label className="flex items-center gap-2.5 cursor-pointer mt-3">
          <input 
            type="checkbox" 
            className="w-4 h-4 accent-black border-black cursor-pointer"
            checked={inStockOnly}
            onChange={() => onToggleInStock?.()}
          />
          <span className="text-sm md:text-base font-medium text-black">In Stock Only</span>
        </label>
      </div>

      <Button 
        variant="outline" 
        className="w-full uppercase text-xs md:text-sm font-black tracking-widest h-12 mt-2" 
        onClick={onClear}
      >
        Clear Filters
      </Button>
    </div>
  );
}

export function ProductFilters(props: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalCategories, setInternalCategories] = useState<string[]>([]);
  const [internalMinPrice, setInternalMinPrice] = useState('');
  const [internalMaxPrice, setInternalMaxPrice] = useState('');
  const [internalSizes, setInternalSizes] = useState<string[]>([]);
  const [internalInStock, setInternalInStock] = useState(false);

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
        className="lg:hidden flex items-center justify-center gap-2 uppercase text-xs font-bold tracking-widest w-full md:w-auto h-10"
        onClick={() => setIsOpen(true)}
      >
        <Filter size={15} /> Filters
      </Button>

      {/* Mobile Slide-out */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white p-6 overflow-y-auto shadow-xl">
            <FilterContent 
              {...filterProps}
              onClose={() => setIsOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 bg-off-white/40 p-6 border border-border">
        <FilterContent {...filterProps} />
      </div>
    </>
  );
}
