import { createClient } from '@/lib/supabase/client';

export interface ProductReview {
  id: string;
  product_id: string;
  name: string;
  city: string;
  rating: number;
  fit: string;
  title: string;
  comment: string;
  verified: boolean;
  created_at: string;
}

const DEFAULT_REVIEWS: Record<string, ProductReview[]> = {
  default: [
    {
      id: 'rev-def-1',
      product_id: 'default',
      name: 'Aditya K.',
      city: 'Bengaluru',
      rating: 5,
      fit: 'True to oversized fit',
      title: 'Remarkable fabric weight & structure',
      comment: 'The 240+ GSM dense combed cotton holds its boxy silhouette perfectly. Even after three machine washes, the collar rib has zero sagging.',
      verified: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'rev-def-2',
      product_id: 'default',
      name: 'Varun S.',
      city: 'Mumbai',
      rating: 5,
      fit: 'Perfect boxy drape',
      title: 'Best oversized tee in Indian streetwear',
      comment: 'Drop shoulder proportion is spot on. The print quality is smooth and heavyweight. Unbeatable value compared to luxury streetwear brands.',
      verified: true,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'rev-def-3',
      product_id: 'default',
      name: 'Sneha R.',
      city: 'Hyderabad',
      rating: 5,
      fit: 'True to oversized fit',
      title: 'Clean aesthetic & super durable',
      comment: 'The monochrome detailing and thick collar make it look high-end. Love the minimalist streetwear look.',
      verified: true,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ],
};

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const supabase = createClient();
    
    // Check in site_settings under `reviews_${productId}`
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', `reviews_${productId}`)
      .maybeSingle();

    if (settingData?.value && Array.isArray(settingData.value) && settingData.value.length > 0) {
      return settingData.value as ProductReview[];
    }

    // Return customized default reviews tagged for this product
    return DEFAULT_REVIEWS.default.map((r, i) => ({
      ...r,
      id: `rev-${productId}-${i}`,
      product_id: productId,
    }));
  } catch (err) {
    console.warn(`Error getting reviews for ${productId}:`, err);
    return DEFAULT_REVIEWS.default.map((r, i) => ({
      ...r,
      id: `rev-${productId}-${i}`,
      product_id: productId,
    }));
  }
}

export async function submitProductReview(
  productId: string,
  reviewInput: {
    name: string;
    city?: string;
    rating: number;
    fit?: string;
    title?: string;
    comment: string;
  }
): Promise<{ success: boolean; review?: ProductReview; error?: string }> {
  try {
    const supabase = createClient();

    const existingReviews = await getProductReviews(productId);

    const newReview: ProductReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: productId,
      name: reviewInput.name.trim() || 'Verified Customer',
      city: reviewInput.city?.trim() || 'India',
      rating: Math.max(1, Math.min(5, Number(reviewInput.rating) || 5)),
      fit: reviewInput.fit?.trim() || 'True to oversized fit',
      title: reviewInput.title?.trim() || 'Great quality fit',
      comment: reviewInput.comment.trim(),
      verified: true,
      created_at: new Date().toISOString(),
    };

    const updatedReviews = [newReview, ...existingReviews];

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: `reviews_${productId}`,
        value: updatedReviews,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving review to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, review: newReview };
  } catch (err: any) {
    console.error('submitProductReview fatal error:', err);
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}
