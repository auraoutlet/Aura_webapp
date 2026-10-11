'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react';
import { Container, Button, Spinner } from '@/components/ui';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || searchParams.get('id') || 'Order Confirmed';

  return (
    <Container className="py-10 md:py-16 min-h-[50vh] flex flex-col justify-center">
      <div className="max-w-xl mx-auto text-center w-full animate-fade-in-up">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-2 text-black">
          Order Confirmed
        </h1>
        
        <p className="text-gray text-xs sm:text-sm mb-6 font-medium">
          Thank you for choosing AURA OUTLET. Your order has been placed and confirmed.
        </p>
        
        <div className="bg-off-white border border-border p-5 mb-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-4 gap-2">
            <div>
              <p className="text-[10px] text-gray uppercase tracking-widest font-bold mb-0.5">Order Number</p>
              <p className="font-black text-base text-black">{orderNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray uppercase tracking-widest font-bold mb-0.5">Date</p>
              <p className="font-bold text-xs text-black">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex gap-2.5">
              <Package className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs mb-0.5 text-black uppercase tracking-wider">Order Updates</h3>
                <p className="text-[11px] text-gray leading-relaxed">Confirmation and tracking updates have been recorded on your account.</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Truck className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs mb-0.5 text-black uppercase tracking-wider">Doorstep Delivery</h3>
                <p className="text-[11px] text-gray leading-relaxed">Dispatched in 24 hours. Delivery in 3-5 business days across India.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`/orders?number=${encodeURIComponent(orderNumber)}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-6 h-11 font-black tracking-widest text-xs uppercase">
              Track This Order
            </Button>
          </Link>
          <Link href="/account/orders" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 h-11 font-black tracking-widest text-xs uppercase">
              View All Orders
            </Button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto px-5 h-11 font-black tracking-widest text-xs uppercase flex items-center justify-center gap-1.5">
              Shop More <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <Container className="py-16 text-center flex justify-center items-center">
        <Spinner size="lg" />
      </Container>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
