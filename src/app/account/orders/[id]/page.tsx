import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockOrders, mockProducts } from '@/lib/mock-data';
import { SectionHeading, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { ChevronRight, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '@/lib/types';

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
  const order = mockOrders.find((o) => o.id === resolvedParams.id);

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

      {/* Timeline */}
      {order.order_status !== 'CANCELLED' && (
        <div className="py-6 overflow-x-auto">
          <div className="min-w-[600px] flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray/20 -z-10 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-black -z-10 -translate-y-1/2 transition-all duration-500"
              style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (timelineSteps.length - 1)) * 100 : 0}%` }}
            ></div>
            
            {timelineSteps.map((step, index) => {
              const isCompleted = currentStepIndex >= index;
              const StepIcon = step.icon;
              
              return (
                <div key={step.status} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted ? 'bg-black border-black text-white' : 'bg-white border-border text-gray'
                  }`}>
                    <StepIcon size={20} />
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider ${isCompleted ? 'text-black' : 'text-gray'}`}>
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
            const product = mockProducts.find(p => p.id === item.product_id);
            return (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="w-20 h-24 bg-off-white flex-shrink-0 flex items-center justify-center">
                  {product?.images?.[0]?.image_url ? (
                    <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-gray">Item</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <Link href={`/products/${product?.slug || ''}`} className="font-medium hover:underline">
                    {item.product_name || product?.name || 'Unknown Product'}
                  </Link>
                  <div className="text-sm text-gray flex gap-4">
                    {item.color && <span>Color: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                  <div className="text-sm">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium">
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
                <span className="font-medium text-black block mb-1">{order.address.full_name}</span>
                {order.address.address_line_1}<br />
                {order.address.address_line_2 && <>{order.address.address_line_2}<br /></>}
                {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                India<br />
                Phone: {order.address.phone}
              </div>
            ) : (
              <p className="text-sm text-gray">No shipping address recorded</p>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-sm border-b border-border pb-2">Payment Status</h3>
            <div className="text-sm text-gray">
              {order.payment_status}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4 bg-off-white p-6">
          <h3 className="font-bold uppercase tracking-wider text-sm border-b border-border pb-2">Order Summary</h3>
          <div className="flex flex-col gap-3 text-sm">
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
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
