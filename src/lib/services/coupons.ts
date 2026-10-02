import { createClient } from '@/lib/supabase/client';
import { Coupon } from '@/lib/types';

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Coupon[];
  } catch (err) {
    console.warn('Supabase getAllCoupons error:', err);
    return [];
  }
}

export async function getActiveCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Coupon;
  } catch (err) {
    console.warn('Supabase getActiveCouponByCode error:', err);
    return null;
  }
}

export async function saveCouponToDb(coupon: Partial<Coupon>): Promise<{ success: boolean; data?: Coupon; error?: string }> {
  try {
    const supabase = createClient();
    const couponId = coupon.id || `coup-${Date.now()}`;

    const { data, error } = await supabase
      .from('coupons')
      .upsert({
        id: couponId,
        code: coupon.code?.toUpperCase(),
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        minimum_order_value: coupon.minimum_order_value || 0,
        maximum_discount: coupon.maximum_discount || null,
        usage_limit: coupon.usage_limit || null,
        is_active: coupon.is_active ?? true,
        expires_at: coupon.expires_at || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Coupon };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCouponFromDb(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      console.error('deleteCouponFromDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteCouponFromDb error:', err);
    return false;
  }
}
