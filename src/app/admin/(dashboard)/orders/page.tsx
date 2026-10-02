'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Search, Eye, Loader2 } from 'lucide-react';
import { Input, TablePagination } from '@/components/ui';
import { getAllOrders } from '@/lib/services/orders';
import { Order } from '@/lib/types';

const TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || order.order_status.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [orders, searchTerm, activeTab]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-success/10 text-success';
      case 'PENDING': return 'bg-warning/10 text-warning';
      case 'CANCELLED': return 'bg-error/10 text-error';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Orders</h1>
        <p className="text-gray-500 text-sm">Manage customer orders and fulfillments dynamically from Supabase database.</p>
      </div>

      <div className="bg-white border border-gray-200">
        {/* Filters */}
        <div className="border-b border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order number..."
                className="pl-9 h-10 rounded-none border-gray-300 w-full"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Total Orders: <strong className="text-black font-bold">{filteredOrders.length}</strong>
            </span>
          </div>
        </div>

        {/* Data Table with Horizontal Scroll */}
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="p-16 flex items-center justify-center gap-3 text-sm text-gray-500 font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-black" />
              Loading orders from database...
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Order Number</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black font-mono">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.address?.full_name || order.user_id || 'Guest Customer'}
                    </td>
                    <td className="px-6 py-4 font-black text-black">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase font-semibold text-gray-600">
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-none ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        title="View Order Details"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No orders found matching your criteria.
          </div>
        ) : !loading && filteredOrders.length > 0 ? (
          <TablePagination
            totalItems={filteredOrders.length}
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
