'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react';
import { Container, Button } from '@/components/ui';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'AO-98472B';

  return (
    <Container className="py-16 md:py-24 min-h-[70vh] flex flex-col justify-center">
      <div className="max-w-2xl mx-auto text-center w-full animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-4 text-black">
          Order Confirmed
        </h1>
        
        <p className="text-gray text-base md:text-lg mb-8 font-medium">
          Thank you for choosing AURA OUTLET. Your order has been placed successfully.
        </p>
        
        <div className="bg-off-white border border-border p-8 mb-10 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 mb-6 gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray uppercase tracking-widest font-bold mb-1">Order Number</p>
              <p className="font-black text-xl text-black">{orderNumber}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray uppercase tracking-widest font-bold mb-1">Date</p>
              <p className="font-bold text-lg text-black">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Package className="w-6 h-6 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base mb-1 text-black">Order Updates</h3>
                <p className="text-sm md:text-base text-gray leading-relaxed">You will receive an email and SMS confirmation shortly with your order tracking link.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Truck className="w-6 h-6 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base mb-1 text-black">Express Shipping</h3>
                <p className="text-sm md:text-base text-gray leading-relaxed">Doorstep delivery within 3-5 business days across India.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/account/orders" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 h-14 font-black tracking-widest text-sm">
              VIEW MY ORDERS
            </Button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-14 font-black tracking-widest text-sm flex items-center justify-center gap-2">
              CONTINUE SHOPPING <ArrowRight className="w-4 h-4 ml-1" />
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
      <Container className="py-20 text-center">
        <p className="text-gray uppercase tracking-wider text-sm">Loading order confirmation...</p>
      </Container>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
