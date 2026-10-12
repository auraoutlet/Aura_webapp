import { NextResponse } from 'next/server';
import { confirmOrderPayment, getOrderById, markOrderFailed, rollbackPendingOrder } from '@/lib/services/orders';

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

      // Fetch payment attempt details to extract exact cf_payment_id (transaction_id) and payment method
      let transactionId = '';
      let paymentMethod = 'Cashfree Online';
      try {
        const payListRes = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
          method: 'GET',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
            'Accept': 'application/json',
          },
        });
        if (payListRes.ok) {
          const payList = await payListRes.json();
          if (Array.isArray(payList) && payList.length > 0) {
            const successfulPay = payList.find((p: any) => p.payment_status === 'SUCCESS') || payList[0];
            transactionId = String(successfulPay.cf_payment_id || '');
            if (successfulPay.payment_group) {
              paymentMethod = successfulPay.payment_group.toUpperCase();
            } else if (successfulPay.payment_method) {
              const methodKey = Object.keys(successfulPay.payment_method)[0];
              paymentMethod = methodKey ? methodKey.toUpperCase() : 'Cashfree Online';
            }
          }
        }
      } catch (payListErr) {
        console.warn('Could not fetch payment list from Cashfree:', payListErr);
      }

      // Confirm the order in the database with complete Cashfree details!
      await confirmOrderPayment(orderId, {
        cashfreeOrderId: String(data.cf_order_id || ''),
        paymentSessionId: String(data.payment_session_id || ''),
        transactionId: transactionId || String(data.cf_order_id || ''),
        amount: data.order_amount,
        method: paymentMethod,
        status: 'SUCCESS',
        rawResponse: data,
      });
    } else if (data.order_status === 'FAILED' || data.order_status === 'USER_DROPPED' || data.order_status === 'CANCELLED') {
      status = 'FAILED';
      // Rollback uncompleted order so invalid/failed orders do not clutter the database or customer orders list
      await rollbackPendingOrder(orderId);
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
