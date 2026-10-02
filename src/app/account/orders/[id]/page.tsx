import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionHeading, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { ChevronRight, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '@/lib/types';
import { getOrderById } from '@/lib/services/orders';

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
  { status: 'PENDING', label: 'Pending', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.id);

  if (!order) {
    notFound();
  }

  const currentStepIndex = timelineSteps.findIndex(s => s.status === order.order_status);

  return (
    <div className="bg-white border border-border p-6 md:p-8 flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray gap-2">
        <Link href="/account" className="hover:text-black transition-colors">Account</Link>
        <ChevronRight size={14} />
        <Link href="/account/orders" className="hover:text-black transition-colors">Orders</Link>
        <ChevronRight size={14} />
        <span className="text-black font-medium">{order.order_number}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <SectionHeading title={`ORDER ${order.order_number}`} align="left" className="mb-2" />
          <div className="text-sm text-gray">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={getStatusVariant(order.order_status)}>{order.order_status}</Badge>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray">Payment:</span>
            <Badge variant={getStatusVariant(order.payment_status)}>{order.payment_status}</Badge>
          </div>
        </div>
      </div>

      {/* Timeline (if not cancelled) */}
      {order.order_status !== 'CANCELLED' && (
        <div className="py-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isPastOrCurrent = currentStepIndex >= idx;
              return (
                <div key={step.status} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isPastOrCurrent ? 'border-black bg-black text-white' : 'border-border bg-white text-gray'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <span className={`text-xs uppercase font-medium ${isPastOrCurrent ? 'text-black font-bold' : 'text-gray'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold uppercase tracking-wider text-sm border-b border-border pb-2">Items</h3>
        <div className="flex flex-col gap-6">
          {(order.items || []).map((item) => {
            return (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="w-20 h-24 bg-off-white flex-shrink-0 flex items-center justify-center border border-border">
                  <span className="text-[10px] uppercase font-bold text-gray">ITEM</span>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="font-bold text-black">
                    {item.product_name || 'AURA OUTLET Item'}
                  </div>
                  <div className="text-sm text-gray flex gap-4">
                    {item.color && <span>Color: <strong className="text-black">{item.color}</strong></span>}
                    {item.size && <span>Size: <strong className="text-black">{item.size}</strong></span>}
                  </div>
                  <div className="text-sm">Qty: <strong className="text-black">{item.quantity}</strong></div>
                </div>
                <div className="font-bold text-base text-black">
                  {formatPrice(item.total_price)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
        {/* Addresses & Info */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-sm border-b border-border pb-2">Shipping Address</h3>
            {order.address ? (
              <div className="text-sm text-gray leading-relaxed">
                <span className="font-bold text-black block mb-1">{order.address.full_name}</span>
                {order.address.address_line_1}<br />
                {order.address.address_line_2 && <>{order.address.address_line_2}<br /></>}
                {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                India<br />
                Phone: {order.address.phone}
              </div>
            ) : (
              <p className="text-sm text-gray">Delivery details recorded with order</p>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-sm border-b border-border pb-2">Payment Details</h3>
            <div className="text-sm text-gray space-y-1">
              <p>Status: <span className="font-bold text-black">{order.payment_status}</span></p>
              <p>Delivery: Standard Courier (3-5 business days)</p>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-off-white p-6 border border-border flex flex-col gap-3">
          <h3 className="font-bold uppercase tracking-wider text-sm border-b border-border pb-2 mb-2">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray">Subtotal</span>
            <span className="font-medium text-black">{formatPrice(order.subtotal)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-success font-medium">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray">Shipping</span>
            <span className="font-medium text-black">{Number(order.shipping_fee) === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-border pt-3 mt-1 text-black">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
