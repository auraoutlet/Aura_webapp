import { NextResponse } from 'next/server';
import { recordPaymentSession } from '@/lib/services/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, customer_name, customer_email, customer_phone } = body;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';

    if (!appId || !secretKey) {
      return NextResponse.json(
        { error: 'Cashfree credentials not configured' },
        { status: 500 }
      );
    }

    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const origin = request.headers.get('origin') || request.headers.get('referer');
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (origin) {
      try {
        siteUrl = new URL(origin).origin;
      } catch {
        // fallback to siteUrl
      }
    }

    const payload = {
      order_id: orderId,
      order_amount: typeof amount === 'number' ? amount : parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer_name || 'Customer',
        customer_email: customer_email || 'customer@auraoutlet.com',
        customer_phone: customer_phone || '9999999999',
      },
      order_meta: {
        return_url: `${siteUrl}/payment/return?order_id={order_id}`,
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Create Order Error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to create Cashfree order' },
        { status: response.status }
      );
    }

    // Immediately record payment session in Supabase with cashfree_order_id and payment_session_id!
    await recordPaymentSession(orderId, {
      cashfreeOrderId: String(data.cf_order_id || ''),
      paymentSessionId: String(data.payment_session_id || ''),
      amount: payload.order_amount,
      rawResponse: data,
    });

    return NextResponse.json({
      payment_session_id: data.payment_session_id,
      cf_order_id: data.cf_order_id,
      order_id: data.order_id,
      environment: environment === 'production' ? 'production' : 'sandbox',
    });
  } catch (error: any) {
    console.error('Error creating cashfree order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
