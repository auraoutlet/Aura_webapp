'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';
import { getOrderById, updateOrderStatusInDb } from '@/lib/services/orders';

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrderDetail({ params }: { params?: Promise<{ id: string }> }) {
  const unwrappedParams = params ? React.use(params) : null;
  const routeParams = useParams();
  const id = unwrappedParams?.id || (Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (id) {
        const found = await getOrderById(id);
        if (found) {
          setOrder(found);
          setSelectedStatus(found.order_status);
        }
      }
    }
    loadOrder();
  }, [id]);

  if (!order) {
    return <div className="p-12 text-center text-gray">Loading order...</div>;
  }

  const handleUpdateStatus = async () => {
    if (!id) return;
    const updatedOrder: Order = {
      ...order,
      order_status: selectedStatus,
      updated_at: new Date().toISOString(),
    };

    await updateOrderStatusInDb(id, selectedStatus);

    setOrder(updatedOrder);
    setFeedback(`Order status successfully updated to ${selectedStatus}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-gray hover:text-black transition-colors p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Order #{order.order_number}</h1>
            <p className="text-xs text-gray-500 font-mono">Date: {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 uppercase text-xs tracking-wider" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-black text-white flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 size={18} className="text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border border-border">
            <div className="p-4 border-b border-border bg-off-white flex justify-between items-center">
              <h2 className="font-bold uppercase tracking-wider text-sm">Order Items ({(order.items || []).length})</h2>
              <span className="text-xs text-gray-500">Payment: <strong className="uppercase text-black">{order.payment_status}</strong></span>
            </div>
            <div className="p-4 overflow-x-auto w-full">
              <table className="w-full min-w-[500px] text-sm">
                <thead className="text-gray uppercase text-xs tracking-wider border-b border-border">
                  <tr>
                    <th className="pb-3 text-left font-medium">Product</th>
                    <th className="pb-3 text-center font-medium">Qty</th>
                    <th className="pb-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(order.items || []).map((item, idx) => {
                    return (
                      <tr key={idx}>
                        <td className="py-4">
                          <div className="flex gap-3">
                            <div className="h-12 w-12 bg-off-white flex-shrink-0 flex items-center justify-center border border-gray-200">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">ITEM</span>
                            </div>
                            <div>
                              <p className="font-bold text-black">{item.product_name || 'AURA OUTLET Item'}</p>
                              <p className="text-xs text-gray-500">Size: {item.size} | Color: {item.color}</p>
                              <p className="text-xs text-gray-500">{formatPrice(item.unit_price)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-bold text-black">{item.quantity}</td>
                        <td className="py-4 text-right font-bold text-black">{formatPrice(item.total_price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-off-white border-t border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray">Shipping</span>
                  <span>{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-bold uppercase tracking-wider mb-4 text-sm">Order Status (Table: `orders`)</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase">Current Status</label>
                <div className="font-bold text-lg text-black mt-1">
                  <span className={`px-2.5 py-1 text-xs tracking-wider uppercase font-bold ${
                    order.order_status === 'DELIVERED' ? 'bg-success/15 text-success' :
                    order.order_status === 'SHIPPED' ? 'bg-black text-white' :
                    order.order_status === 'CANCELLED' ? 'bg-error/15 text-error' :
                    'bg-warning/15 text-warning'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray uppercase">Update Status</label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    options={ORDER_STATUS_OPTIONS}
                  />
                  <Button variant="primary" onClick={handleUpdateStatus} className="uppercase text-xs tracking-wider whitespace-nowrap">
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-bold uppercase tracking-wider mb-4 text-sm">Customer Info</h2>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-black">{order.address?.full_name || order.user_id}</p>
              <p className="text-xs text-gray font-mono">User ID: {order.user_id}</p>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-bold uppercase tracking-wider mb-4 text-sm">Shipping Address</h2>
            {order.address ? (
              <div className="text-sm space-y-1">
                <p className="font-bold">{order.address.full_name}</p>
                <p>{order.address.address_line_1}</p>
                {order.address.address_line_2 && <p>{order.address.address_line_2}</p>}
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p className="pt-2 text-gray text-xs font-medium">Phone: {order.address.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-gray">No shipping address recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
