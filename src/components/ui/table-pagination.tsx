'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200 text-sm text-gray-700 select-none',
        className
      )}
    >
      {/* Left: Items Count & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
        <span className="text-gray-500 font-medium">
          Showing <strong className="text-black font-bold">{startItem}</strong> to{' '}
          <strong className="text-black font-bold">{endItem}</strong> of{' '}
          <strong className="text-black font-bold">{totalItems}</strong> entries
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="pageSizeSelect" className="text-xs text-gray-500 font-medium whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="border border-gray-300 rounded px-2.5 py-1 text-xs font-bold bg-white text-black focus:border-black outline-none cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={validCurrentPage === 1}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 transition-colors"
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 transition-colors"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-gray-400 font-bold">
                  ...
                </span>
              );
            }

            const isCurrent = page === validCurrentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(Number(page))}
                className={cn(
                  'min-w-[32px] h-8 px-2 flex items-center justify-center text-xs font-bold rounded transition-colors',
                  isCurrent
                    ? 'bg-black text-white'
                    : 'border border-gray-300 text-gray-700 hover:border-black hover:text-black bg-white'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 transition-colors"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={validCurrentPage === totalPages}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 transition-colors"
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
