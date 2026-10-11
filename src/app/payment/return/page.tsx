'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Button, Spinner } from '@/components/ui';
import { useCartStore } from '@/lib/store';

function PaymentReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState('');
  const clearCart = useCartStore(s => s.clearCart);

  useEffect(() => {
    let isCancelled = false;

    const verifyPayment = async () => {
      const orderId = searchParams.get('order_id');
      if (!orderId) {
        setStatus('failed');
        setError('No order ID found in the payment return callback');
        return;
      }

      try {
        const res = await fetch('/api/cashfree/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (isCancelled) return;

        if (data.status === 'SUCCESS') {
          // Clear cart on payment success
          clearCart();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pendingOrderData');
          }

          const orderNum = data.orderNumber || orderId;
          const ordId = data.orderId || orderId;
          router.push(`/order-success?order=${encodeURIComponent(orderNum)}&id=${encodeURIComponent(ordId)}`);
        } else {
          setStatus('failed');
          setError(data.error || data.message || `Payment status: ${data.order_status || 'Incomplete'}`);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setStatus('failed');
          setError('An unexpected error occurred while verifying your payment. If money was debited, your order will be confirmed shortly.');
        }
      }
    };

    verifyPayment();

    return () => {
      isCancelled = true;
    };
  }, [router, searchParams, clearCart]);

  if (status === 'verifying') {
    return (
      <Container className="py-24 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Spinner size="lg" className="mb-6" />
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-black">Verifying Payment...</h1>
        <p className="text-gray-600 mt-3 text-sm max-w-sm">Please do not refresh or close this window while we secure your order.</p>
      </Container>
    );
  }

  return (
    <Container className="py-20 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-red-50 border border-error/30 p-8 max-w-md w-full text-center shadow-md">
        <h1 className="text-2xl font-black text-error mb-3 uppercase tracking-wider">Payment Not Completed</h1>
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">{error}</p>
        <div className="space-y-3">
          <Button onClick={() => router.push('/checkout')} className="w-full font-bold uppercase tracking-widest h-12">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push('/shop')} className="w-full font-bold uppercase tracking-widest h-12">
            Back to Shop
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<Container className="py-24 flex justify-center min-h-[50vh]"><Spinner size="lg" /></Container>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
