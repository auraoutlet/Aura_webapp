import { createClient } from '@/lib/supabase/client';
import { Product, ProductVariant, ProductImage } from '@/lib/types';

export async function getProducts(options?: {
  categoryId?: string;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.isFeatured !== undefined) {
      query = query.eq('is_featured', options.isFeatured);
    }
    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data as Product[];
  } catch (err) {
    console.warn('Supabase getProducts error:', err);
    return [];
  }
}

export async function getAllAdminProducts(): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Product[];
  } catch (err) {
    console.warn('Supabase getAllAdminProducts error:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Product;
  } catch (err) {
    console.warn('Supabase getProductBySlug error:', err);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Product;
  } catch (err) {
    console.warn('Supabase getProductById error:', err);
    return null;
  }
}

export async function saveProductToDb(
  productData: Omit<Product, 'images' | 'variants' | 'category'>,
  variants: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[],
  images: { image_url: string; alt_text?: string; is_primary: boolean }[]
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const supabase = createClient();
    const productId = productData.id || `prod-${Date.now()}`;

    // 1. Upsert product
    const { error: prodError } = await supabase.from('products').upsert({
      id: productId,
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      category_id: productData.category_id,
      base_price: productData.base_price,
      sale_price: productData.sale_price,
      brand: productData.brand || 'AURA OUTLET',
      is_active: productData.is_active,
      is_featured: productData.is_featured,
      updated_at: new Date().toISOString(),
    });

    if (prodError) throw prodError;

    // 2. Upsert variants
    if (variants && variants.length > 0) {
      await supabase.from('product_variants').delete().eq('product_id', productId);

      const variantInserts = variants.map((v, i) => ({
        id: `var-${productId}-${i + 1}`,
        product_id: productId,
        size: v.size,
        color: v.color,
        sku: v.sku || `${productData.slug.toUpperCase()}-${v.size}-${v.color.toUpperCase()}`,
        price: v.price || productData.sale_price || productData.base_price,
        stock_quantity: v.stock_quantity ?? 10,
        is_active: v.is_active ?? true,
      }));

      const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
      if (varError) throw varError;
    }

    // 3. Upsert images
    if (images && images.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', productId);

      const imageInserts = images.map((img, i) => ({
        id: `img-${productId}-${i + 1}`,
        product_id: productId,
        image_url: img.image_url,
        alt_text: img.alt_text || productData.name,
        is_primary: img.is_primary ?? i === 0,
        sort_order: i,
      }));

      const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
      if (imgError) throw imgError;
    }

    return { success: true, id: productId };
  } catch (err: any) {
    console.error('saveProductToDb error:', err);
    return { success: false, id: '', error: err.message };
  }
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('deleteProductFromDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteProductFromDb error:', err);
    return false;
  }
}
