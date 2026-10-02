'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { IndianRupee, ShoppingBag, Clock, Users, Package, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge, Button, Spinner } from '@/components/ui';
import { getAllOrders } from '@/lib/services/orders';
import { Order } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();

        // 1. Fetch Orders
        const ordersData = await getAllOrders();
        setOrders(ordersData);

        const salesSum = ordersData.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        setTotalSales(salesSum);

        // 2. Fetch Customers Count
        const { count: custCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
        setTotalCustomers(custCount || 0);

        // 3. Fetch Products Count
        const { count: prodCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        setTotalProducts(prodCount || 0);

        // 4. Fetch Low Stock Count
        const { count: lowStock } = await supabase
          .from('product_variants')
          .select('*', { count: 'exact', head: true })
          .lte('stock_quantity', 5);
        setLowStockCount(lowStock || 0);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const pendingOrdersCount = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.order_status)).length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { title: 'Total Sales', value: formatPrice(totalSales), icon: IndianRupee },
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag },
    { title: 'Pending Orders', value: pendingOrdersCount, icon: Clock },
    { title: 'Total Customers', value: totalCustomers, icon: Users },
    { title: 'Total Products', value: totalProducts, icon: Package },
    { title: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-success text-white';
      case 'PENDING': return 'bg-warning text-white';
      case 'PROCESSING': return 'bg-blue-600 text-white';
      case 'CONFIRMED': return 'bg-black text-white';
      case 'CANCELLED': return 'bg-error text-white';
      default: return 'bg-black text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-success text-white';
      case 'PENDING': return 'bg-warning text-white';
      case 'FAILED': return 'bg-error text-white';
      default: return 'bg-black text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Dashboard</h1>
        <p className="text-gray-500 text-sm">Real-time overview of your store&apos;s live performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{stat.title}</h3>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl md:text-3xl font-black text-black">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">Recent Orders</h2>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="gap-2 font-bold text-xs uppercase tracking-wider">
              <span>View All Orders</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-sm uppercase tracking-wider text-black">No Orders Placed Yet</p>
            <p className="text-xs text-gray-400 mt-1">Orders placed by customers will appear here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Order #</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Payment</th>
                  <th className="px-6 py-4 font-bold text-right">Total</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-black">{order.order_number}</td>
                    <td className="px-6 py-4 font-medium text-black">
                      {order.address?.full_name || 'Customer'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-none ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-none ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-black">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5">
                          <Eye size={14} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
