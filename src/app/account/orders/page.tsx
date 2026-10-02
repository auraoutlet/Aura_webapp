import React from 'react';
import Link from 'next/link';
import { mockOrders } from '@/lib/mock-data';
import { SectionHeading, EmptyState, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Package } from 'lucide-react';
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

export default function OrdersPage() {
  const orders = [...mockOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="bg-white border border-border p-6 md:p-8 min-h-[500px]">
      <SectionHeading title="MY ORDERS" align="left" className="mb-8" />

      {orders.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any orders yet. Start shopping to see your orders here."
          actionLabel="CONTINUE SHOPPING"
          actionHref="/shop"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            return (
              <div key={order.id} className="border border-border p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-black transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{order.order_number}</span>
                    <Badge variant={getStatusVariant(order.order_status)}>{order.order_status}</Badge>
                  </div>
                  <div className="text-sm text-gray flex flex-wrap gap-4">
                    <span>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    <span>•</span>
                    <span className="font-semibold text-black">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray">Payment:</span>
                    <Badge variant={getStatusVariant(order.payment_status)}>{order.payment_status}</Badge>
                  </div>
                  <Link 
                    href={`/account/orders/${order.id}`}
                    className="text-sm font-medium underline underline-offset-4 hover:text-gray transition-colors w-full md:w-auto text-center"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
