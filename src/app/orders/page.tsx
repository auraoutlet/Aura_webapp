'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container, Button, Input, Badge, Spinner } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { 
  Search, 
  Package, 
  CheckCircle, 
  Truck, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { getOrderById } from '@/lib/services/orders';
import { createClient } from '@/lib/supabase/client';

function getStatusVariant(status: OrderStatus | PaymentStatus) {
  switch (status) {
    case 'DELIVERED':
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
    case 'PROCESSING':
    case 'CONFIRMED':
    case 'SHIPPED':
      return 'warning';
    case 'CANCELLED':
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
}

const timelineSteps = [
  { status: 'PENDING', label: 'Payment Received', icon: Clock },
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle },
  { status: 'PROCESSING', label: 'In Production', icon: Package },
  { status: 'SHIPPED', label: 'Handed to Courier', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: ShieldCheck },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryOrder = searchParams.get('number') || searchParams.get('id') || '';

  const [orderQuery, setOrderQuery] = useState(queryOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Auto-search if param is provided
  useEffect(() => {
    if (queryOrder) {
      handleSearchOrder(queryOrder);
    }
  }, [queryOrder]);

  // Load user's recent orders if logged in
  useEffect(() => {
    async function checkUserOrders() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('orders')
            .select('id, order_number, order_status, total_amount, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);
          if (data) setRecentOrders(data);
        }
      } catch (err) {
        // silent fail
      }
    }
    checkUserOrders();
  }, []);

  const handleSearchOrder = async (orderIdOrNumber: string) => {
    const cleanId = orderIdOrNumber.trim();
    if (!cleanId) return;

    setLoading(true);
    setSearched(true);
    try {
      const result = await getOrderById(cleanId);
      setOrder(result);
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order 
    ? timelineSteps.findIndex(s => s.status === order.order_status)
    : -1;

  return (
    <div className="py-8 md:py-12 bg-white min-h-[75vh]">
      <Container className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray mb-1">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2 text-border">/</span>
            <span className="text-black">Track Order</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            Track Your Order
          </h1>
          <p className="text-xs md:text-sm text-gray mt-1">
            Enter your order number (e.g. <strong>AO-4TBM1Z</strong>) to check real-time courier and delivery status.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-off-white border border-border p-4 md:p-6 mb-8">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchOrder(orderQuery);
            }} 
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Input
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order Number (e.g. AO-4TBM1Z or ord_...)"
                className="h-11 pl-10 text-xs md:text-sm font-semibold uppercase"
                required
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 text-xs font-black uppercase tracking-wider shrink-0"
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              {loading ? 'Searching...' : 'Track Order'}
            </Button>
          </form>

          {/* Quick link to recent orders if available */}
          {recentOrders.length > 0 && !order && (
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray block mb-2">
                Your Recent Orders:
              </span>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => {
                      setOrderQuery(rec.order_number || rec.id);
                      handleSearchOrder(rec.order_number || rec.id);
                    }}
                    className="text-xs bg-white border border-border px-3 py-1.5 font-bold hover:border-black transition-colors flex items-center gap-2"
                  >
                    <span>{rec.order_number || rec.id}</span>
                    <Badge variant={getStatusVariant(rec.order_status)} className="text-[9px] px-1 py-0">
                      {rec.order_status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center border border-border bg-off-white/30 flex flex-col items-center justify-center">
            <Spinner size="lg" className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray">Fetching order details...</p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && searched && !order && (
          <div className="py-12 px-6 text-center border border-border bg-off-white/40">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-black mb-1">
              Order Not Found
            </h3>
            <p className="text-xs text-gray max-w-md mx-auto mb-4">
              We couldn&apos;t find an order matching &ldquo;<span className="font-bold text-black">{orderQuery}</span>&rdquo;. Please verify the order number in your confirmation email or account dashboard.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/account/orders">
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase">
                  View Account Orders
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="sm" className="text-xs font-bold uppercase">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Order Details Result */}
        {!loading && order && (
          <div className="border border-border bg-white p-5 md:p-8 space-y-6 animate-fade-in shadow-sm">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray uppercase tracking-widest block mb-0.5">
                  Order Details
                </span>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-black uppercase text-black">
                    {order.order_number}
                  </h2>
                  <Badge variant={getStatusVariant(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </div>
                <p className="text-xs text-gray mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:text-right">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-gray uppercase tracking-widest block">
                    Payment Status
                  </span>
                  <div className="flex items-center gap-1.5 sm:justify-end mt-0.5">
                    <Badge variant={getStatusVariant(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Timeline Tracker */}
            {order.order_status !== 'CANCELLED' && (
              <div className="py-4 px-2 bg-off-white border border-border">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-black mb-4">
                  Shipment Progress
                </h4>
                <div className="grid grid-cols-5 gap-1 text-center relative">
                  {timelineSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <div key={step.status} className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCurrent
                            ? 'border-black bg-black text-white ring-2 ring-black/20'
                            : isDone
                            ? 'border-black bg-black text-white'
                            : 'border-border bg-white text-gray'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-tight leading-tight ${
                          isDone ? 'text-black' : 'text-gray'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier & Tracking Details Card */}
            {(order.tracking_id || order.courier_name) && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-900" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                      Dispatched via {order.courier_name || 'Courier Partner'}
                    </span>
                  </div>
                  {order.tracking_id && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-gray-600">AWB / Tracking Number:</span>
                      <strong className="font-mono text-sm text-black bg-white px-2 py-0.5 border border-blue-200 rounded">
                        {order.tracking_id}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {order.tracking_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(order.tracking_id || '');
                        alert('Tracking ID copied to clipboard!');
                      }}
                      className="h-8 text-xs font-bold uppercase bg-white border-blue-300 text-blue-900 hover:bg-blue-100"
                    >
                      Copy ID
                    </Button>
                  )}
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 px-3 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 rounded transition-colors"
                    >
                      Track Package <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black border-b border-border pb-2">
                Items In This Order ({order.items?.length || 0})
              </h4>
              <div className="divide-y divide-border">
                {(order.items || []).map((item) => {
                  const product = item.product;
                  const imageUrl = product?.images?.[0]?.image_url;
                  const productSlug = product?.slug;

                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-off-white border border-border flex items-center justify-center font-bold text-[10px] text-gray uppercase shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            'AO'
                          )}
                        </div>
                        <div>
                          {productSlug ? (
                            <Link 
                              href={`/products/${productSlug}`} 
                              className="text-xs md:text-sm font-bold text-black hover:underline"
                            >
                              {item.product_name}
                            </Link>
                          ) : (
                            <p className="text-xs md:text-sm font-bold text-black">{item.product_name}</p>
                          )}
                          <p className="text-[11px] text-gray">
                            {item.color && <>Color: <strong className="text-black">{item.color}</strong> • </>}
                            Size: <strong className="text-black">{item.size}</strong> • Qty: <strong className="text-black">{item.quantity}</strong>
                          </p>
                          {productSlug && (
                            <Link 
                              href={`/products/${productSlug}`} 
                              className="text-[10px] font-bold uppercase tracking-wider text-black underline underline-offset-2 hover:opacity-75 inline-block mt-0.5"
                            >
                              View Product →
                            </Link>
                          )}
                        </div>
                      </div>
                      <span className="text-xs md:text-sm font-bold text-black shrink-0">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery & Payment Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
              <div className="p-4 border border-border bg-off-white space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-black mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Address</span>
                </div>
                {order.address ? (
                  <div className="text-gray text-[11px] leading-relaxed">
                    <strong className="text-black block">{order.address.full_name}</strong>
                    <p>{order.address.address_line_1}</p>
                    {order.address.address_line_2 && <p>{order.address.address_line_2}</p>}
                    <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p className="mt-1 text-black font-semibold">Phone: {order.address.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray text-[11px]">Address recorded with order fulfillment.</p>
                )}
              </div>

              <div className="p-4 border border-border bg-off-white space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-black mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payment Summary</span>
                </div>
                <div className="text-gray text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-black">{formatPrice(order.subtotal)}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount:</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="font-semibold text-black">
                      {Number(order.shipping_fee) === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border font-bold text-xs text-black">
                    <span>Total Amount:</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                  {(() => {
                    const payObj: any = Array.isArray(order.payment) ? order.payment[0] : order.payment;
                    if (!payObj?.transaction_id) return null;
                    return (
                      <div className="pt-1.5 text-[10px] text-gray">
                        Ref ID: <span className="font-mono text-black font-semibold">{payObj.transaction_id}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Back action */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <Link href="/account/orders" className="font-bold text-black hover:underline uppercase tracking-wider">
                &larr; View All Account Orders
              </Link>
              <Link href="/shop" className="font-bold text-black hover:underline uppercase tracking-wider flex items-center gap-1">
                Shop New Drops <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <Container className="py-20 text-center flex justify-center items-center">
        <Spinner size="lg" />
      </Container>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
