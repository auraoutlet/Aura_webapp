import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/lib/types';
import { mockOrders } from '@/lib/mock-data';

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

    if (error || !data || data.length === 0) {
      return mockOrders;
    }

    return data as Order[];
  } catch (err) {
    console.warn('Supabase getAllOrders error, using fallback:', err);
    return mockOrders;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        items:order_items(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return mockOrders.find(o => o.id === id) || null;
    }

    return data as Order;
  } catch (err) {
    console.warn('Supabase getOrderById error:', err);
    return mockOrders.find(o => o.id === id) || null;
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
