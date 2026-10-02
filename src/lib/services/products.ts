import { createClient } from '@/lib/supabase/client';
import { Product, ProductVariant, ProductImage } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';

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

    if (error || !data || data.length === 0) {
      // Fallback gracefully to mock data
      let filtered = [...mockProducts];
      if (options?.categoryId) {
        filtered = filtered.filter(p => p.category_id === options.categoryId);
      }
      if (options?.isFeatured !== undefined) {
        filtered = filtered.filter(p => p.is_featured === options.isFeatured);
      }
      if (options?.search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(options.search!.toLowerCase()));
      }
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      return filtered;
    }

    return data as Product[];
  } catch (err) {
    console.warn('Supabase getProducts error, using fallback:', err);
    return mockProducts;
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

    if (error || !data || data.length === 0) {
      return mockProducts;
    }

    return data as Product[];
  } catch (err) {
    console.warn('Supabase getAllAdminProducts error:', err);
    return mockProducts;
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
      return mockProducts.find(p => p.slug === slug) || null;
    }

    return data as Product;
  } catch (err) {
    console.warn('Supabase getProductBySlug error:', err);
    return mockProducts.find(p => p.slug === slug) || null;
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
      return mockProducts.find(p => p.id === id) || null;
    }

    return data as Product;
  } catch (err) {
    console.warn('Supabase getProductById error:', err);
    return mockProducts.find(p => p.id === id) || null;
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

    if (prodError) {
      console.error('Error saving product:', prodError);
      return { success: false, id: productId, error: prodError.message };
    }

    // 2. Delete existing variants and re-insert
    await supabase.from('product_variants').delete().eq('product_id', productId);
    if (variants.length > 0) {
      const variantRows = variants.map((v, i) => ({
        id: `var-${productId}-${i}`,
        product_id: productId,
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: v.price,
        stock_quantity: v.stock_quantity,
        is_active: v.is_active,
      }));
      await supabase.from('product_variants').insert(variantRows);
    }

    // 3. Delete existing images and re-insert
    await supabase.from('product_images').delete().eq('product_id', productId);
    if (images.length > 0) {
      const imageRows = images.map((img, i) => ({
        id: `img-${productId}-${i}`,
        product_id: productId,
        image_url: img.image_url,
        alt_text: img.alt_text || productData.name,
        sort_order: i,
        is_primary: img.is_primary,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    return { success: true, id: productId };
  } catch (err: any) {
    console.error('saveProductToDb failed:', err);
    return { success: false, id: productData.id, error: err.message };
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
    console.error('deleteProductFromDb exception:', err);
    return false;
  }
}
