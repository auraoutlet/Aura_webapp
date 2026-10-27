'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Search, Eye, Loader2, Trash2, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Input, Button, TablePagination } from '@/components/ui';
import { getAllOrders, deleteOrderFromDb, deletePendingOrFailedOrders } from '@/lib/services/orders';
import { Order } from '@/lib/types';

const TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const pendingOrFailedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.payment_status?.toUpperCase() === 'PENDING' ||
        o.payment_status?.toUpperCase() === 'FAILED' ||
        o.order_status?.toUpperCase() === 'CANCELLED' ||
        o.order_status?.toUpperCase() === 'PENDING'
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.phone?.includes(searchTerm) ||
        (order.tracking_id && order.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTab =
        activeTab === 'All' || order.order_status.toLowerCase() === activeTab.toLowerCase();
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

  const handleDeleteSingle = async (order: Order) => {
    const confirmMsg = `Are you sure you want to permanently delete order #${order.order_number}?\nThis will remove the order, items, and payment logs completely.`;
    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    const ok = await deleteOrderFromDb(order.id);
    setIsDeleting(false);

    if (ok) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setActionFeedback(`Order #${order.order_number} was permanently deleted.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleClearAllPendingOrFailed = async () => {
    const count = pendingOrFailedOrders.length;
    if (count === 0) return;

    const confirmMsg = `Are you sure you want to permanently delete ALL ${count} pending/failed/abandoned orders?\nThis will clear failed payment sessions from the database.`;
    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    const result = await deletePendingOrFailedOrders();
    setIsDeleting(false);

    if (result.success) {
      await loadOrders();
      setActionFeedback(`Successfully deleted ${result.count} pending / failed orders.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      alert('Could not delete some pending orders. Please check database permissions.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-success/10 text-success';
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'CANCELLED':
        return 'bg-error/10 text-error';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWhatsAppLink = (order: Order) => {
    const rawPhone = order.address?.phone?.replace(/\D/g, '') || '';
    if (!rawPhone) return null;
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const customerName = order.address?.full_name || 'Customer';

    let message = `Hi ${customerName}! 🖤 Greetings from *AURA OUTLET*.\n\nRegarding your Order *#${order.order_number}*:\nStatus: *${order.order_status}*`;

    if (order.tracking_id) {
      message += `\nCourier: *${order.courier_name || 'Standard Courier'}*\nTracking ID: *${order.tracking_id}*`;
      if (order.tracking_url) {
        message += `\nTrack: ${order.tracking_url}`;
      } else {
        message += `\nTrack your order: https://www.auraoutlet.in/orders?number=${order.order_number}`;
      }
    } else {
      message += `\nTrack your order anytime: https://www.auraoutlet.in/orders?number=${order.order_number}`;
    }

    message += `\n\nThank you for choosing Aura Outlet! Reach us here if you have any questions.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Orders</h1>
          <p className="text-gray-500 text-sm">
            Manage customer orders, update tracking IDs, send WhatsApp notifications, and fulfillments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingOrFailedOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={handleClearAllPendingOrFailed}
              className="h-9 text-xs font-bold uppercase tracking-wider text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500 transition-colors"
              title="Delete all pending/abandoned/failed checkout orders"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Pending/Failed ({pendingOrFailedOrders.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="h-9 text-xs uppercase"
            title="Refresh order records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-black text-white text-xs font-semibold rounded flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-gray-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200">
        {/* Filters */}
        <div className="border-b border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => (
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
                placeholder="Search by order #, name, phone, tracking..."
                className="pl-9 h-10 rounded-none border-gray-300 w-full text-xs"
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
            <table className="w-full min-w-[850px] text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Order Number</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Tracking</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => {
                  const waLink = getWhatsAppLink(order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-black font-mono">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline text-black"
                        >
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div>
                          <p className="font-bold">{order.address?.full_name || order.user_id || 'Guest Customer'}</p>
                          {order.address?.phone && (
                            <p className="text-[11px] text-gray-500 font-mono">
                              {order.address.phone}
                            </p>
                          )}
                          {order.address?.state && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              {order.address.city ? `${order.address.city}, ` : ''}
                              {order.address.state}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.tracking_id ? (
                          <div className="space-y-0.5">
                            <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-mono font-bold rounded block max-w-fit">
                              {order.tracking_id}
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              {order.courier_name || 'Courier'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(order.items || []).slice(0, 3).map((it, idx) => {
                            const img =
                              it.product?.images?.find((im: any) => im.is_primary)?.image_url ||
                              it.product?.images?.[0]?.image_url;
                            return (
                              <div
                                key={idx}
                                className="w-10 h-12 bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center rounded"
                                title={`${it.product_name} • Size: ${it.size} • Qty: ${it.quantity}`}
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    alt={it.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[8px] font-bold text-gray-400">AO</span>
                                )}
                              </div>
                            );
                          })}
                          {(order.items || []).length > 3 && (
                            <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-1 rounded">
                              +{(order.items || []).length - 3}
                            </span>
                          )}
                          <div className="max-w-[140px] truncate">
                            <p className="text-xs font-semibold text-black truncate">
                              {order.items?.[0]?.product_name || 'Item'}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {order.items?.length === 1
                                ? `Size: ${order.items[0]?.size || 'Std'} • Qty: ${order.items[0]?.quantity || 1}`
                                : `${order.items?.reduce((s, it) => s + (it.quantity || 1), 0)} items total`}
                            </p>
                          </div>
                        </div>
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
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-none ${getStatusColor(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="Send WhatsApp update to customer"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="View / Edit Order Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteSingle(order)}
                            disabled={isDeleting}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete this order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
