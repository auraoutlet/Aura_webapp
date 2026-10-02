'use client';

import React, { useState, useMemo } from 'react';
import { mockCustomers, mockOrders } from '@/lib/mock-data';
import { formatPrice, getInitials } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input, TablePagination } from '@/components/ui';

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(c => 
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.email ? c.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    );
  }, [searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Customers</h1>
        <p className="text-gray-500 text-sm">Manage your store's customers.</p>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search customers..."
              className="pl-9 h-10 rounded-none border-gray-300 w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Total Customers: <strong className="text-black font-bold">{filteredCustomers.length}</strong>
          </span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => {
                const customerOrders = mockOrders.filter(o => o.user_id === customer.id);
                const totalSpent = customerOrders.reduce((sum, o) => sum + o.total_amount, 0);

                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {getInitials(customer.full_name)}
                        </div>
                        <div className="font-bold text-black">{customer.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-black">{customer.email || 'N/A'}</div>
                      {customer.phone && <div className="text-xs text-gray-500">{customer.phone}</div>}
                    </td>
                    <td className="px-6 py-4 font-bold text-black">{customerOrders.length}</td>
                    <td className="px-6 py-4 font-bold uppercase text-xs">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No customers found.
          </div>
        ) : (
          <TablePagination
            totalItems={filteredCustomers.length}
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
