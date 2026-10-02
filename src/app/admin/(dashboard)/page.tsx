'use client';

import React from 'react';
import { mockDashboardStats, mockOrders } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import { IndianRupee, ShoppingBag, Clock, Users, Package, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Sales', value: formatPrice(mockDashboardStats.totalSales), icon: IndianRupee },
    { title: 'Total Orders', value: mockDashboardStats.totalOrders, icon: ShoppingBag },
    { title: 'Pending Orders', value: mockDashboardStats.pendingOrders, icon: Clock },
    { title: 'Total Customers', value: mockDashboardStats.totalCustomers, icon: Users },
    { title: 'Total Products', value: mockDashboardStats.totalProducts, icon: Package },
    { title: 'Low Stock Products', value: mockDashboardStats.lowStockProducts, icon: AlertTriangle },
  ];

  const recentOrders = mockOrders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-success text-white';
      case 'PENDING': return 'bg-warning text-white';
      case 'CANCELLED': return 'bg-error text-white';
      default: return 'bg-black text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success text-white';
      case 'PENDING': return 'bg-warning text-white';
      case 'FAILED': return 'bg-error text-white';
      case 'REFUNDED': return 'bg-gray-500 text-white';
      default: return 'bg-black text-white';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">DASHBOARD</h1>
        <p className="text-gray-500">Overview of your store&apos;s performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[750px] text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order #</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{order.order_number}</td>
                  <td className="px-6 py-4">{order.user_id}</td>
                  <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-none ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-none ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-gray-500 hover:text-black">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
