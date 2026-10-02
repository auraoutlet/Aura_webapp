'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeading, EmptyState, Badge, Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Package, ExternalLink } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '@/lib/types';
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              items:order_items(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setOrders(data);
          }
        }
      } catch (e) {
        console.error('Error loading orders:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white border border-border p-8 min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 md:p-8 min-h-[500px]">
      <SectionHeading title="MY ORDERS" align="left" className="mb-8" />

      {orders.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any orders yet. Start exploring our collections to see your orders here."
          actionLabel="START SHOPPING"
          actionHref="/shop"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const itemCount = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
            return (
              <div key={order.id} className="border border-border p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-black transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{order.order_number || `#${order.id.slice(0, 8)}`}</span>
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

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <Link href={`/order-confirmation/${order.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <span>View Details</span>
                      <ExternalLink size={14} />
                    </Button>
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
