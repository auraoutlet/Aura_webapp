import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/lib/types';

export interface CreateOrderItemInput {
  productId: string;
  variantId?: string;
  productName: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CreateOrderInput {
  orderId?: string;
  orderNumber?: string;
  userId: string;
  addressId?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  items: CreateOrderItemInput[];
  couponCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: OrderStatus;
  notes?: string;
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        items:order_items(*, product:products(*, images:product_images(*)))
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Order[];
  } catch (err) {
    console.warn('Supabase getAllOrders error:', err);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const supabase = createClient();
    
    // Check by id or by order_number
    let query = supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        items:order_items(*, product:products(*, images:product_images(*))),
        payment:payments(*)
      `);

    if (id.startsWith('AO-')) {
      query = query.eq('order_number', id);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Order;
  } catch (err) {
    console.warn('Supabase getOrderById error:', err);
    return null;
  }
}

export async function createOrderInDb(input: CreateOrderInput): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    const supabase = createClient();

    const orderId = input.orderId || ('ord_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
    const orderNumber = input.orderNumber || ('AO-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    const orderStatus = input.orderStatus || (input.paymentStatus?.toUpperCase() === 'PENDING' ? 'PENDING' : 'CONFIRMED');

    // 1. Insert order
    const { error: orderError } = await supabase
      .from('orders')
      .upsert({
        id: orderId,
        order_number: orderNumber,
        user_id: input.userId,
        address_id: input.addressId || null,
        subtotal: input.subtotal.toFixed(2),
        discount: input.discount.toFixed(2),
        shipping_fee: input.shippingFee.toFixed(2),
        total_amount: input.totalAmount.toFixed(2),
        payment_status: (input.paymentStatus || 'SUCCESS').toUpperCase(),
        order_status: orderStatus,
        notes: input.notes || null,
        updated_at: new Date().toISOString(),
      });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return { success: false, error: orderError.message };
    }

    // 2. Insert order items
    if (input.items && input.items.length > 0) {
      const itemsToInsert = input.items.map((item, idx) => ({
        id: `item_${orderId}_${idx}`,
        order_id: orderId,
        product_id: item.productId || null,
        variant_id: item.variantId || null,
        product_name: item.productName,
        size: item.size,
        color: item.color,
        unit_price: item.unitPrice.toFixed(2),
        quantity: item.quantity,
        total_price: item.totalPrice.toFixed(2),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
      }
    }

    // 3. Insert payment record
    const { error: payError } = await supabase
      .from('payments')
      .insert({
        id: `pay_${orderId}`,
        order_id: orderId,
        amount: input.totalAmount.toFixed(2),
        status: (input.paymentStatus || 'SUCCESS').toUpperCase(),
        payment_method: input.paymentMethod || 'Online (Simulated)',
      });

    if (payError) {
      console.error('Error inserting payment:', payError);
    }

    // 4. Update coupon usage if applicable
    if (input.couponCode) {
      try {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('id, used_count')
          .eq('code', input.couponCode.trim().toUpperCase())
          .maybeSingle();

        if (coupon) {
          await supabase.from('coupon_usages').insert({
            id: `usage_${orderId}`,
            coupon_id: coupon.id,
            user_id: input.userId,
            order_id: orderId,
          });

          await supabase
            .from('coupons')
            .update({ used_count: (coupon.used_count || 0) + 1 })
            .eq('id', coupon.id);
        }
      } catch (couponErr) {
        console.warn('Coupon usage record error:', couponErr);
      }
    }

    return {
      success: true,
      orderId,
      orderNumber,
    };
  } catch (err: any) {
    console.error('createOrderInDb fatal error:', err);
    return { success: false, error: err.message || 'Failed to place order' };
  }
}

export async function updateOrderStatusInDb(id: string, status: OrderStatus): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('updateOrderStatusInDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('updateOrderStatusInDb error:', err);
    return false;
  }
}

export interface ConfirmPaymentDetails {
  paymentId?: string;
  method?: string;
  amount?: number;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  transactionId?: string;
  status?: string;
  rawResponse?: any;
}

export async function recordPaymentSession(
  orderId: string,
  sessionDetails: {
    cashfreeOrderId: string;
    paymentSessionId: string;
    amount: number;
    rawResponse?: any;
  }
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('payments')
      .upsert({
        id: `pay_${orderId}`,
        order_id: orderId,
        cashfree_order_id: String(sessionDetails.cashfreeOrderId),
        payment_session_id: sessionDetails.paymentSessionId,
        amount: Number(sessionDetails.amount).toFixed(2),
        status: 'PENDING',
        payment_method: 'Cashfree Online',
        raw_response: sessionDetails.rawResponse || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error recording payment session in DB:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('recordPaymentSession error:', err);
    return false;
  }
}

export async function confirmOrderPayment(
  orderId: string, 
  paymentDetails?: ConfirmPaymentDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // 1. Update order status and payment status in orders table
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'SUCCESS',
        order_status: 'CONFIRMED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error confirming order payment in DB:', orderError);
      return { success: false, error: orderError.message };
    }

    // 2. Find existing payment row for this order to prevent duplicate rows
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, cashfree_order_id, payment_session_id, transaction_id, raw_response')
      .eq('order_id', orderId)
      .maybeSingle();

    const payId = existingPayment?.id || `pay_${orderId}`;

    const { error: payError } = await supabase
      .from('payments')
      .upsert({
        id: payId,
        order_id: orderId,
        cashfree_order_id: paymentDetails?.cashfreeOrderId ? String(paymentDetails.cashfreeOrderId) : (existingPayment?.cashfree_order_id || null),
        payment_session_id: paymentDetails?.paymentSessionId || existingPayment?.payment_session_id || null,
        transaction_id: paymentDetails?.transactionId ? String(paymentDetails.transactionId) : (existingPayment?.transaction_id || null),
        amount: paymentDetails?.amount ? Number(paymentDetails.amount).toFixed(2) : undefined,
        status: (paymentDetails?.status || 'SUCCESS').toUpperCase(),
        payment_method: paymentDetails?.method || 'Cashfree Online',
        raw_response: paymentDetails?.rawResponse || existingPayment?.raw_response || null,
        updated_at: new Date().toISOString(),
      });

    if (payError) {
      console.error('Error upserting payment row in DB:', payError);
    }

    return { success: true };
  } catch (err: any) {
    console.error('confirmOrderPayment fatal error:', err);
    return { success: false, error: err.message };
  }
}

export async function markOrderFailed(orderId: string, reason?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'FAILED',
        notes: reason ? `Payment failed: ${reason}` : 'Payment failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return !error;
  } catch (err) {
    console.error('markOrderFailed error:', err);
    return false;
  }
}

export async function rollbackPendingOrder(orderId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // First remove associated items and payments
    await supabase.from('order_items').delete().eq('order_id', orderId);
    await supabase.from('payments').delete().eq('order_id', orderId);
    
    // Delete the pending/failed order from orders table
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .in('payment_status', ['PENDING', 'FAILED']);

    if (error) {
      console.warn('Could not hard delete pending order, marking as CANCELLED/FAILED:', error);
      await supabase
        .from('orders')
        .update({
          payment_status: 'FAILED',
          order_status: 'CANCELLED',
          notes: 'Transaction failed or abandoned by user',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }

    return true;
  } catch (err) {
    console.error('rollbackPendingOrder error:', err);
    return false;
  }
}

export async function updateOrderTrackingInDb(
  orderId: string,
  tracking: {
    tracking_id?: string | null;
    courier_name?: string | null;
    tracking_url?: string | null;
    order_status?: OrderStatus;
  }
): Promise<boolean> {
  try {
    const supabase = createClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (tracking.tracking_id !== undefined) updatePayload.tracking_id = tracking.tracking_id;
    if (tracking.courier_name !== undefined) updatePayload.courier_name = tracking.courier_name;
    if (tracking.tracking_url !== undefined) updatePayload.tracking_url = tracking.tracking_url;
    if (tracking.order_status !== undefined) updatePayload.order_status = tracking.order_status;

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      console.error('updateOrderTrackingInDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('updateOrderTrackingInDb error:', err);
    return false;
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    // 1. Delete associated order items
    await supabase.from('order_items').delete().eq('order_id', orderId);
    // 2. Delete associated payments
    await supabase.from('payments').delete().eq('order_id', orderId);
    // 3. Delete the order
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('deleteOrderFromDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteOrderFromDb error:', err);
    return false;
  }
}

export async function deletePendingOrFailedOrders(): Promise<{ success: boolean; count: number }> {
  try {
    const supabase = createClient();
    // Fetch pending or failed order ids
    const { data: staleOrders, error: fetchErr } = await supabase
      .from('orders')
      .select('id')
      .or('payment_status.in.(PENDING,FAILED),order_status.in.(CANCELLED)');

    if (fetchErr || !staleOrders || staleOrders.length === 0) {
      return { success: true, count: 0 };
    }

    const ids = staleOrders.map((o) => o.id);

    // Delete associated order items & payments
    await supabase.from('order_items').delete().in('order_id', ids);
    await supabase.from('payments').delete().in('order_id', ids);

    // Delete orders
    const { error: delErr } = await supabase.from('orders').delete().in('id', ids);
    if (delErr) {
      console.error('deletePendingOrFailedOrders error:', delErr);
      return { success: false, count: 0 };
    }

    return { success: true, count: ids.length };
  } catch (err) {
    console.error('deletePendingOrFailedOrders fatal error:', err);
    return { success: false, count: 0 };
  }
}

