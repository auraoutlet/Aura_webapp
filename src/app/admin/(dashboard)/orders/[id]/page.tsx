'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  X, 
  FileText, 
  Truck, 
  MessageCircle, 
  Trash2, 
  Copy, 
  Check 
} from 'lucide-react';
import { Button, Select, Input } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';
import { 
  getOrderById, 
  updateOrderStatusInDb, 
  updateOrderTrackingInDb, 
  deleteOrderFromDb 
} from '@/lib/services/orders';
import { isTamilNaduState } from '@/lib/services/settings';

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped (Dispatched)' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const POPULAR_COURIERS = [
  'ST Courier',
  'DTDC',
  'Delhivery',
  'Professional Couriers',
  'India Post',
  'Blue Dart',
  'Shadowfax',
];

export default function AdminOrderDetail({ params }: { params?: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = params ? React.use(params) : null;
  const routeParams = useParams();
  const id = unwrappedParams?.id || (Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // Tracking State
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (id) {
        const found = await getOrderById(id);
        if (found) {
          setOrder(found);
          setSelectedStatus(found.order_status);
          setCourierName(found.courier_name || '');
          setTrackingId(found.tracking_id || '');
          setTrackingUrl(found.tracking_url || '');
        }
      }
    }
    loadOrder();
  }, [id]);

  if (!order) {
    return <div className="p-12 text-center text-gray font-medium">Loading order details...</div>;
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

  const handleSaveTracking = async () => {
    if (!id) return;
    setIsSavingTracking(true);

    // Auto-fill common tracking URL if omitted and recognized
    let resolvedUrl = trackingUrl.trim();
    if (!resolvedUrl && trackingId.trim()) {
      const c = courierName.toLowerCase();
      if (c.includes('delhivery')) {
        resolvedUrl = `https://www.delhivery.com/track/package/${trackingId.trim()}`;
      } else if (c.includes('st')) {
        resolvedUrl = 'https://stcourier.com/track';
      } else if (c.includes('dtdc')) {
        resolvedUrl = 'https://www.dtdc.in/tracking.asp';
      } else if (c.includes('post')) {
        resolvedUrl = 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx';
      }
    }

    // If order was PENDING or PROCESSING, and tracking ID is entered, also set status to SHIPPED
    const nextStatus = (selectedStatus === 'PENDING' || selectedStatus === 'PROCESSING') && trackingId.trim()
      ? 'SHIPPED'
      : selectedStatus;

    const ok = await updateOrderTrackingInDb(id, {
      courier_name: courierName.trim() || null,
      tracking_id: trackingId.trim() || null,
      tracking_url: resolvedUrl || null,
      order_status: nextStatus,
    });

    setIsSavingTracking(false);

    if (ok) {
      setSelectedStatus(nextStatus);
      setTrackingUrl(resolvedUrl);
      setOrder({
        ...order,
        courier_name: courierName.trim() || null,
        tracking_id: trackingId.trim() || null,
        tracking_url: resolvedUrl || null,
        order_status: nextStatus,
      });
      setFeedback('Courier & Tracking details saved successfully!');
      setTimeout(() => setFeedback(null), 3500);
    } else {
      alert('Failed to save tracking info. Please check database connection.');
    }
  };

  const handleDeleteOrder = async () => {
    if (!id) return;
    const confirmMsg = `Are you sure you want to permanently delete order #${order.order_number}?\nThis action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    const ok = await deleteOrderFromDb(id);
    setIsDeleting(false);

    if (ok) {
      alert(`Order #${order.order_number} was permanently deleted.`);
      router.push('/admin/orders');
    } else {
      alert('Could not delete order. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isTN = isTamilNaduState(order.address?.state);
  const isCodOrder = Boolean(
    order.payment?.payment_method?.toLowerCase().includes('cod') ||
    order.payment?.payment_method?.toLowerCase().includes('cash') ||
    (order.notes && order.notes.toLowerCase().includes('cod'))
  );

  const codAdvancePaid = 200;
  const codBalanceDue = Math.max(0, order.total_amount - codAdvancePaid);

  // Generate WhatsApp Message according to status
  const customerName = order.address?.full_name || 'Customer';
  const cleanPhone = (order.address?.phone || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const itemListString = (order.items || [])
    .map((it) => `• ${it.product_name} (${it.size}) x${it.quantity}`)
    .join('\n');

  let waMessage = '';
  if (selectedStatus === 'SHIPPED') {
    waMessage = `Hi ${customerName}! 🚀 Your Aura Outlet order *#${order.order_number}* has been dispatched!\n\n📦 *Order Items:*\n${itemListString}\n\n🚚 *Courier Partner:* ${courierName || 'Standard Courier'}\n🔢 *Tracking ID / AWB:* ${trackingId || 'In Transit'}\n${trackingUrl ? `🔗 *Track your parcel:* ${trackingUrl}` : `🔗 *Track your parcel:* https://www.auraoutlet.in/orders?number=${order.order_number}`}\n\nThank you for shopping with *AURA OUTLET*! Feel free to reply if you need any help. 🖤`;
  } else if (selectedStatus === 'DELIVERED') {
    waMessage = `Hi ${customerName}! 🎉 Your Aura Outlet order *#${order.order_number}* has been successfully delivered!\n\nWe hope you love your heavyweight fit. Tag us *@auraoutlet* in your photos! 🖤\n\nNeed support? Reply to this message anytime.`;
  } else if (selectedStatus === 'CONFIRMED') {
    waMessage = `Hi ${customerName}! ✅ Your Aura Outlet order *#${order.order_number}* has been confirmed!\n\n📦 *Items:*\n${itemListString}\n💰 *Total:* ${formatPrice(order.total_amount)}\n\nOur team is currently preparing your parcel for dispatch. We will send you the courier tracking ID shortly!\n\nThank you for choosing *AURA OUTLET*! 🖤`;
  } else {
    waMessage = `Hi ${customerName}! 🖤 Regarding your Aura Outlet order *#${order.order_number}*:\n\nCurrent Status: *${selectedStatus}*\n\nTrack your order anytime: https://www.auraoutlet.in/orders?number=${order.order_number}\n\nReach us here if you have any questions!`;
  }

  const handleCopyWAMessage = () => {
    navigator.clipboard.writeText(waMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SCREEN VIEW (Hidden when printing via window.print)                   */}
      {/* ========================================================================= */}
      <div className="max-w-5xl mx-auto space-y-6 print:hidden">
        {/* Top Bar with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/orders" 
              className="text-gray hover:text-black transition-colors p-2 hover:bg-gray-100 rounded"
              title="Back to Orders"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">
                  Order #{order.order_number}
                </h1>
                {isCodOrder && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] uppercase rounded">
                    COD Order
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Placed: {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="h-10 uppercase text-xs tracking-wider"
              onClick={() => setShowInvoicePreview(true)}
            >
              <Eye className="mr-1.5 h-4 w-4" /> Preview Invoice
            </Button>
            <Button 
              variant="primary" 
              className="h-10 uppercase text-xs tracking-wider bg-black text-white hover:bg-neutral-800" 
              onClick={handlePrint}
            >
              <Printer className="mr-1.5 h-4 w-4" /> Print Invoice
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="h-10 text-xs text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500 uppercase tracking-wider"
              title="Delete Order Permanently"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {feedback && (
          <div className="p-4 bg-black text-white flex items-center gap-3 animate-fade-in text-sm font-semibold rounded">
            <CheckCircle2 size={18} className="text-green-400" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Products Ordered & Tracking Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courier & Tracking Fulfillment Manager */}
            <div className="bg-white border-2 border-black p-5 rounded">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-black" />
                  <h2 className="font-black uppercase tracking-wider text-sm text-black">
                    Courier & Tracking Information
                  </h2>
                </div>
                {order.tracking_id && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded">
                    Tracking Added
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Courier Partner
                    </label>
                    <Input
                      placeholder="e.g. ST Courier, DTDC, Delhivery"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="h-10 text-xs"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {POPULAR_COURIERS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCourierName(c)}
                          className="text-[10px] bg-gray-100 hover:bg-black hover:text-white px-2 py-0.5 rounded transition-colors text-gray-700 font-medium"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Tracking ID / AWB Number *
                    </label>
                    <Input
                      placeholder="e.g. ST12984928"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Tracking URL (Optional - direct package link)
                  </label>
                  <Input
                    placeholder="https://... or leave empty to auto-link"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="h-10 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-gray-500">
                    Entering tracking info will automatically mark the order as <strong>SHIPPED</strong>.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleSaveTracking}
                    disabled={isSavingTracking}
                    className="h-9 px-5 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800"
                  >
                    {isSavingTracking ? 'Saving...' : 'Save Tracking Info'}
                  </Button>
                </div>
              </div>
            </div>

            {/* WhatsApp Customer Alert Card */}
            <div className="bg-emerald-50/70 border border-emerald-300 p-5 rounded">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-700" />
                  <h2 className="font-black uppercase tracking-wider text-sm text-emerald-950">
                    WhatsApp Customer Notification
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  One-Click Customer Alert
                </span>
              </div>

              <p className="text-xs text-emerald-900 mb-3">
                Send an immediate WhatsApp message to <strong>{order.address?.full_name || 'Customer'}</strong> ({order.address?.phone || 'No phone'}) with their tracking details and order status.
              </p>

              {/* Pre-formatted Message Preview */}
              <div className="bg-white p-3 rounded border border-emerald-200 text-xs text-gray-800 font-mono whitespace-pre-wrap mb-4 max-h-40 overflow-y-auto">
                {waMessage}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {formattedPhone ? (
                  <a
                    href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Open WhatsApp Chat
                  </a>
                ) : (
                  <span className="text-xs text-red-600 font-bold">
                    No phone number found in order address.
                  </span>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWAMessage}
                  className="h-9 text-xs font-bold uppercase border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                >
                  {copiedMsg ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-green-700" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Message
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-border">
              <div className="p-4 border-b border-border bg-off-white flex justify-between items-center">
                <h2 className="font-bold uppercase tracking-wider text-sm">
                  Products in Order ({(order.items || []).length})
                </h2>
                <div className="text-xs text-gray-500">
                  Payment: <strong className="uppercase text-black">{order.payment_status}</strong>
                </div>
              </div>

              <div className="p-4 overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
                  <thead className="text-[11px] uppercase tracking-wider text-gray-500 border-b border-border pb-2">
                    <tr>
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium text-center">Qty</th>
                      <th className="pb-2 font-medium text-right">Unit Price</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(order.items || []).map((item, idx) => {
                      const itemImg = 
                        item.product?.images?.find((im: any) => im.is_primary)?.image_url ||
                        item.product?.images?.[0]?.image_url ||
                        (item as any).image_url;

                      return (
                        <tr key={idx}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 bg-gray-100 border border-border shrink-0 rounded overflow-hidden flex items-center justify-center">
                                {itemImg ? (
                                  <img 
                                    src={itemImg} 
                                    alt={item.product_name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <span className="text-[9px] font-bold text-gray-400">AO</span>
                                )}
                              </div>
                              <div>
                                {item.product?.slug ? (
                                  <Link 
                                    href={`/shop/${item.product.slug}`} 
                                    className="font-bold text-black hover:underline flex items-center gap-1"
                                    target="_blank"
                                  >
                                    {item.product_name} <ExternalLink size={12} className="text-gray-400" />
                                  </Link>
                                ) : (
                                  <p className="font-bold text-black">{item.product_name}</p>
                                )}

                                <p className="text-xs text-gray-500 mt-0.5">
                                  Size: <strong className="text-black font-semibold">{item.size}</strong> • Color: <strong className="text-black font-semibold">{item.color}</strong>
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                  SKU: {item.product_id || item.variant_id || 'STD'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center font-bold text-black">{item.quantity}</td>
                          <td className="py-4 text-right text-gray-600">{formatPrice(item.unit_price)}</td>
                          <td className="py-4 text-right font-black text-black">{formatPrice(item.total_price)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 bg-off-white border-t border-border">
                <div className="space-y-2 text-sm max-w-sm ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray">Items Subtotal</span>
                    <span className="font-semibold text-black">{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Coupon Discount</span>
                      <span className="font-bold">-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray">
                      Shipping Charge
                      {order.address?.state && (
                        <span className="ml-1 text-[10px] text-gray-500 font-medium">
                          ({isTN ? 'Tamil Nadu' : order.address.state})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-black">
                      {order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-lg pt-2 border-t border-border mt-2 text-black">
                    <span>Total Order Value</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>

                  {isCodOrder && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-1">
                      <div className="flex justify-between text-amber-900 font-bold">
                        <span>Advance Paid Online:</span>
                        <span>{formatPrice(codAdvancePaid)}</span>
                      </div>
                      <div className="flex justify-between text-black font-black">
                        <span>Doorstep Cash Balance:</span>
                        <span className="text-amber-900">{formatPrice(codBalanceDue)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Notes (if any) */}
            {order.notes && (
              <div className="bg-white border border-border p-4 rounded">
                <h3 className="font-bold uppercase tracking-wider text-xs text-gray-500 mb-1">
                  Order System Notes
                </h3>
                <p className="text-xs text-gray-800 leading-relaxed font-mono bg-gray-50 p-2.5 rounded border border-gray-200">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar: Order Status & Shipping Info */}
          <div className="space-y-6">
            {/* Status Update Control */}
            <div className="bg-white border border-border p-5">
              <h2 className="font-bold uppercase tracking-wider mb-3 text-xs text-black">Order Fulfillment Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray uppercase tracking-wider">Current State</label>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 text-xs tracking-wider uppercase font-bold inline-block rounded-none ${
                      order.order_status === 'DELIVERED' ? 'bg-success/15 text-success' :
                      order.order_status === 'SHIPPED' ? 'bg-blue-100 text-blue-900' :
                      order.order_status === 'CANCELLED' ? 'bg-error/15 text-error' :
                      'bg-warning/15 text-warning'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-[10px] font-bold text-gray uppercase tracking-wider">Update Status</label>
                  <div className="flex gap-2">
                    <Select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                      options={ORDER_STATUS_OPTIONS}
                      className="text-xs h-9"
                    />
                    <Button 
                      variant="primary" 
                      onClick={handleUpdateStatus} 
                      className="uppercase text-xs tracking-wider whitespace-nowrap h-9 bg-black text-white hover:bg-neutral-800"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Destination & Rates */}
            <div className="bg-white border border-border p-5">
              <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                <h2 className="font-bold uppercase tracking-wider text-xs text-black">Shipping Destination</h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  isTN ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isTN ? 'Tamil Nadu (Local)' : 'Outside TN (National)'}
                </span>
              </div>

              {order.address ? (
                <div className="text-xs space-y-1.5 text-gray-700 leading-relaxed">
                  <p className="font-bold text-black text-sm">{order.address.full_name}</p>
                  <p>{order.address.address_line_1}</p>
                  {order.address.address_line_2 && <p>{order.address.address_line_2}</p>}
                  <p className="font-medium text-black">
                    {order.address.city}, {order.address.state} - <span className="font-mono">{order.address.pincode}</span>
                  </p>
                  <div className="pt-2 border-t border-border mt-2 space-y-1">
                    <p className="text-black font-semibold">Phone: <span className="font-mono">{order.address.phone}</span></p>
                    <p className="text-gray-500 font-mono text-[11px]">User ID: {order.user_id}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No address recorded for this order</p>
              )}
            </div>

            {/* Payment Record */}
            <div className="bg-white border border-border p-5">
              <h2 className="font-bold uppercase tracking-wider mb-3 text-xs text-black border-b border-border pb-2">
                Payment Details
              </h2>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-bold text-black">
                    {order.payment?.payment_method || (isCodOrder ? 'Cash on Delivery' : 'Online / Prepaid')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold uppercase text-black">{order.payment_status}</span>
                </div>
                {order.payment?.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono text-[11px]">{order.payment.transaction_id}</span>
                  </div>
                )}
                {order.payment?.cashfree_order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cashfree Ref:</span>
                    <span className="font-mono text-[11px] truncate max-w-[140px]">{order.payment.cashfree_order_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INVOICE PREVIEW MODAL (On-Screen Interactive Preview)                   */}
      {/* ========================================================================= */}
      {showInvoicePreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded shadow-2xl border border-border">
            <div className="sticky top-0 bg-black text-white p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Retail Tax Invoice Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handlePrint}
                  className="h-8 text-xs font-bold uppercase bg-white text-black hover:bg-gray-100"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print Now
                </Button>
                <button 
                  onClick={() => setShowInvoicePreview(false)} 
                  className="p-1 text-white hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <InvoiceDocument 
                order={order} 
                isTN={isTN} 
                isCodOrder={isCodOrder} 
                codAdvancePaid={codAdvancePaid} 
                codBalanceDue={codBalanceDue} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED PRINTABLE INVOICE (Visible ONLY during window.print)          */}
      {/* ========================================================================= */}
      <div className="hidden print:block w-full">
        <InvoiceDocument 
          order={order} 
          isTN={isTN} 
          isCodOrder={isCodOrder} 
          codAdvancePaid={codAdvancePaid} 
          codBalanceDue={codBalanceDue} 
        />
      </div>
    </>
  );
}

/**
 * Clean, Publication-Grade Retail Tax Invoice
 * Designed for perfect A4 rendering with zero layout distortion.
 */
function InvoiceDocument({
  order,
  isTN,
  isCodOrder,
  codAdvancePaid,
  codBalanceDue,
}: {
  order: Order;
  isTN: boolean;
  isCodOrder: boolean;
  codAdvancePaid: number;
  codBalanceDue: number;
}) {
  return (
    <div className="w-full text-black font-sans leading-tight bg-white p-4 sm:p-6 print:p-0">
      {/* Invoice Top Header */}
      <div className="border-b-2 border-black pb-4 mb-5">
        <div className="flex justify-between items-start">
          {/* Brand Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-black">
              AURA OUTLET
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600 mt-0.5">
              Heavyweight Streetwear Label
            </p>
            <div className="text-[11px] text-gray-700 mt-2 space-y-0.5">
              <p>Salem, Tamil Nadu, India — 636302</p>
              <p>Email: <strong>support@auraoutlet.com</strong> | WhatsApp: <strong>+91 83009 48486</strong></p>
              <p>Website: <strong>www.auraoutlet.in</strong></p>
            </div>
          </div>

          {/* Invoice Identification Block */}
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest">
              RETAIL TAX INVOICE
            </span>
            <div className="text-[11px] text-gray-800 mt-2 space-y-1 font-mono">
              <p><strong>Invoice No:</strong> INV-{order.order_number}</p>
              <p><strong>Order No:</strong> #{order.order_number}</p>
              <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p><strong>Invoice Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To & Ship To Details */}
      <div className="grid grid-cols-2 gap-4 border border-black p-3.5 mb-3 text-xs bg-gray-50/50">
        <div>
          <h4 className="font-black uppercase tracking-wider text-[10px] text-gray-500 mb-1 border-b border-gray-300 pb-0.5">
            Customer / Billed To
          </h4>
          <p className="font-bold text-black text-sm">{order.address?.full_name || 'Valued Customer'}</p>
          <p className="text-gray-700 mt-0.5 font-mono">Phone: {order.address?.phone || 'N/A'}</p>
          <p className="text-gray-500 text-[11px] font-mono">Customer ID: {order.user_id}</p>
        </div>

        <div>
          <h4 className="font-black uppercase tracking-wider text-[10px] text-gray-500 mb-1 border-b border-gray-300 pb-0.5">
            Shipping Destination ({isTN ? 'Tamil Nadu' : 'Outside Tamil Nadu'})
          </h4>
          {order.address ? (
            <div className="text-gray-800 space-y-0.5">
              <p className="font-semibold">{order.address.full_name}</p>
              <p>{order.address.address_line_1}</p>
              {order.address.address_line_2 && <p>{order.address.address_line_2}</p>}
              <p className="font-bold text-black">
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
              <p className="text-gray-700 font-mono">Contact: {order.address.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No delivery address provided</p>
          )}
        </div>
      </div>

      {/* Courier & Tracking Line (if available) */}
      {(order.courier_name || order.tracking_id) && (
        <div className="border border-black p-2.5 mb-5 bg-blue-50/40 text-xs flex justify-between items-center">
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-600 mr-2">
              Courier Partner:
            </span>
            <strong className="text-black">{order.courier_name || 'Standard Logistics'}</strong>
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-600 mr-2">
              AWB / Tracking Number:
            </span>
            <strong className="font-mono text-black">{order.tracking_id || 'Assigned'}</strong>
          </div>
        </div>
      )}

      {/* Itemized Products Table */}
      <table className="w-full text-xs border border-black mb-5">
        <thead className="bg-black text-white uppercase text-[10px] tracking-wider">
          <tr>
            <th className="p-2.5 text-center w-12 border-r border-white/20">S.No</th>
            <th className="p-2.5 text-left border-r border-white/20">Description of Goods</th>
            <th className="p-2.5 text-center w-16 border-r border-white/20">Qty</th>
            <th className="p-2.5 text-right w-24 border-r border-white/20">Unit Rate (₹)</th>
            <th className="p-2.5 text-right w-24">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {(order.items || []).map((item, idx) => (
            <tr key={idx} className="align-top">
              <td className="p-2.5 text-center font-bold text-gray-600 border-r border-gray-300">
                {idx + 1}
              </td>
              <td className="p-2.5 border-r border-gray-300">
                <p className="font-bold text-black text-[13px]">{item.product_name || 'AURA OUTLET Streetwear Tee'}</p>
                <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                  Size: <strong className="text-black">{item.size}</strong> • Color: <strong className="text-black">{item.color}</strong> • 240+ GSM Cotton Blanks
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  SKU: {item.product_id || item.variant_id || 'AO-STD'}
                </p>
              </td>
              <td className="p-2.5 text-center font-bold text-black border-r border-gray-300">
                {item.quantity}
              </td>
              <td className="p-2.5 text-right font-mono border-r border-gray-300">
                {formatPrice(item.unit_price)}
              </td>
              <td className="p-2.5 text-right font-bold text-black font-mono">
                {formatPrice(item.total_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Financial Breakdown */}
      <div className="flex justify-between items-start gap-6 mb-6">
        {/* Payment & Mode Stamp */}
        <div className="flex-1 border border-gray-300 p-3 bg-gray-50 text-xs space-y-1.5">
          <h5 className="font-black uppercase tracking-wider text-[10px] text-gray-700 border-b border-gray-200 pb-1">
            Payment & Settlement Mode
          </h5>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Channel:</span>
            <span className="font-bold uppercase text-black">
              {order.payment?.payment_method || (isCodOrder ? 'Cash on Delivery (Advance Paid)' : 'Prepaid Online')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Status:</span>
            <span className="font-black uppercase text-green-700">{order.payment_status}</span>
          </div>
          {order.payment?.transaction_id && (
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-gray-500">Ref / Txn ID:</span>
              <span>{order.payment.transaction_id}</span>
            </div>
          )}

          {isCodOrder && (
            <div className="mt-2 pt-2 border-t border-amber-300 bg-amber-50/70 p-2 text-amber-950 font-medium">
              <div className="flex justify-between text-xs font-bold">
                <span>Online Advance Paid:</span>
                <span className="text-green-700">₹{codAdvancePaid}.00 (PAID)</span>
              </div>
              <div className="flex justify-between text-xs font-black text-black pt-1">
                <span>Cash Due at Doorstep:</span>
                <span className="text-red-700 font-bold">{formatPrice(codBalanceDue)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Table */}
        <div className="w-72 border border-black p-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-mono font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Coupon Discount:</span>
              <span className="font-mono font-bold">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">
              Shipping & Delivery {isTN ? '(TN)' : '(National)'}:
            </span>
            <span className="font-mono font-medium">
              {order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
            </span>
          </div>
          <div className="flex justify-between font-black text-sm border-t-2 border-black pt-2 mt-2 text-black">
            <span>Grand Total:</span>
            <span className="font-mono">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Terms & Signature */}
      <div className="border-t border-black pt-4 flex justify-between items-end text-[10px] text-gray-600">
        <div className="max-w-md space-y-1">
          <p className="font-bold text-black uppercase tracking-wider">Terms & Conditions:</p>
          <p>1. 7-day doorstep replacement or size exchange available for unused items with brand tags attached.</p>
          <p>2. This is a computer-generated invoice and does not require an ink signature.</p>
          <p className="text-black font-semibold pt-1">Thank you for supporting AURA OUTLET Streetwear!</p>
        </div>

        <div className="text-right">
          <p className="font-bold uppercase text-black text-xs">For AURA OUTLET</p>
          <div className="h-10"></div>
          <p className="border-t border-gray-400 pt-1 font-mono text-[10px] uppercase">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
