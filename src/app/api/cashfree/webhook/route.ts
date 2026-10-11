import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmOrderPayment, markOrderFailed } from '@/lib/services/orders';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');
    const rawBody = await req.text();

    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!secretKey) {
      console.error('Webhook Error: CASHFREE_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify webhook signature if headers are provided
    if (signature && timestamp) {
      const signedPayload = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signedPayload)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.warn('Cashfree webhook signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log('Received Cashfree webhook event:', payload.type, 'Order:', payload.data?.order?.order_id);

    const eventType = payload.type;
    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;
    const orderId = orderData?.order_id;

    if (!orderId) {
      return NextResponse.json({ status: 'IGNORED', message: 'No order_id in webhook' }, { status: 200 });
    }

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentData?.payment_status === 'SUCCESS') {
      const amount = paymentData?.payment_amount || orderData?.order_amount;
      const method = paymentData?.payment_group || 'Cashfree Online';

      await confirmOrderPayment(orderId, {
        cashfreeOrderId: String(orderData?.cf_order_id || ''),
        paymentSessionId: String(orderData?.payment_session_id || ''),
        transactionId: String(paymentData?.cf_payment_id || ''),
        amount: typeof amount === 'number' ? amount : parseFloat(amount),
        method,
        status: 'SUCCESS',
        rawResponse: payload,
      });

      console.log(`Order ${orderId} successfully confirmed via Cashfree webhook with transaction ${paymentData?.cf_payment_id}`);
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || paymentData?.payment_status === 'FAILED') {
      await markOrderFailed(orderId, paymentData?.payment_message || 'Payment marked failed by Cashfree');
      console.log(`Order ${orderId} marked failed via Cashfree webhook`);
    }

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (err: any) {
    console.error('Cashfree Webhook Handler Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
