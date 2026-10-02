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
  userId: string;
  addressId?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  items: CreateOrderItemInput[];
  couponCode?: string;
  paymentMethod?: string;
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
        items:order_items(*)
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
        items:order_items(*),
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

    const orderId = 'ord_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const orderNumber = 'AO-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Insert order
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        user_id: input.userId,
        address_id: input.addressId || null,
        subtotal: input.subtotal.toFixed(2),
        discount: input.discount.toFixed(2),
        shipping_fee: input.shippingFee.toFixed(2),
        total_amount: input.totalAmount.toFixed(2),
        payment_status: 'SUCCESS',
        order_status: 'CONFIRMED',
        notes: input.notes || null,
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
        status: 'SUCCESS',
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
