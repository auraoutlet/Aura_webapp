import { NextResponse } from 'next/server';
import { confirmOrderPayment, getOrderById, markOrderFailed } from '@/lib/services/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

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

    const response = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Verify Order Error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to verify Cashfree order' },
        { status: response.status }
      );
    }

    // Cashfree returns order_status ('PAID', 'ACTIVE', 'FAILED', etc.)
    let status = 'PENDING';
    if (data.order_status === 'PAID') {
      status = 'SUCCESS';
      // Confirm the order in the database immediately!
      await confirmOrderPayment(orderId, {
        paymentId: data.cf_payment_id || `cf_${orderId}`,
        amount: data.order_amount,
        method: data.payment_method || 'Cashfree Online',
      });
    } else if (data.order_status === 'FAILED') {
      status = 'FAILED';
      await markOrderFailed(orderId, 'Cashfree marked order as failed');
    }

    // Retrieve order number for the success page
    const existingOrder = await getOrderById(orderId);

    return NextResponse.json({
      status,
      order_status: data.order_status,
      orderNumber: existingOrder?.order_number || orderId,
      orderId: existingOrder?.id || orderId,
      payment_details: data,
    });
  } catch (error: any) {
    console.error('Error verifying cashfree order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
