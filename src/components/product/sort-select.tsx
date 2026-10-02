'use client';

import { useState } from 'react';

interface SortSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const [internalSort, setInternalSort] = useState('newest');
  const sort = value !== undefined ? value : internalSort;

  const handleChange = (newVal: string) => {
    if (onChange) {
      onChange(newVal);
    } else {
      setInternalSort(newVal);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs md:text-sm font-bold text-gray uppercase tracking-widest hidden md:inline">Sort by:</span>
      <select 
        value={sort}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-2 md:py-2.5 border-2 border-border text-xs md:text-sm font-bold outline-none focus:border-black bg-white cursor-pointer uppercase tracking-wider transition-colors"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="featured">Featured</option>
      </select>
    </div>
  );
}
