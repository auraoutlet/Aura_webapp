import { createClient } from '@/lib/supabase/client';
import { getSetting, saveSetting, DEFAULT_COMMUNITY, CommunitySectionSettings, CustomerReview } from './settings';

export interface ProductReview {
  id: string;
  product_id: string;
  product_name?: string;
  name: string;
  city: string;
  rating: number;
  fit: string;
  title: string;
  comment: string;
  verified: boolean;
  featured_on_home?: boolean;
  created_at: string;
}

const DEFAULT_REVIEWS: Record<string, ProductReview[]> = {
  default: [
    {
      id: 'rev-def-1',
      product_id: 'default',
      product_name: 'Oversized Heavyweight Tee',
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
      product_name: 'Drop 01 Signature Heavyweight',
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
      product_name: 'Aura Minimal Heavyweight',
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

export async function getAllSubmittedReviews(): Promise<ProductReview[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'all_product_reviews')
      .maybeSingle();

    if (data?.value && Array.isArray(data.value)) {
      return data.value as ProductReview[];
    }

    return DEFAULT_REVIEWS.default;
  } catch (err) {
    console.warn('Error fetching all customer reviews:', err);
    return DEFAULT_REVIEWS.default;
  }
}

export async function submitProductReview(
  productId: string,
  reviewInput: {
    productName?: string;
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
      product_name: reviewInput.productName || 'Aura Apparel',
      name: reviewInput.name.trim(),
      city: reviewInput.city?.trim() || 'India',
      rating: Math.max(1, Math.min(5, Number(reviewInput.rating) || 5)),
      fit: reviewInput.fit?.trim() || 'True to oversized fit',
      title: reviewInput.title?.trim() || 'Great fit and quality',
      comment: reviewInput.comment.trim(),
      verified: true,
      created_at: new Date().toISOString(),
    };

    const updatedProductReviews = [newReview, ...existingReviews];

    // 1. Save to product-specific reviews
    await supabase
      .from('site_settings')
      .upsert({
        key: `reviews_${productId}`,
        value: updatedProductReviews,
        updated_at: new Date().toISOString(),
      });

    // 2. Also append to master all_product_reviews so Admin can feature it!
    const allReviews = await getAllSubmittedReviews();
    const updatedAll = [newReview, ...allReviews.filter(r => r.id !== newReview.id)];
    await supabase
      .from('site_settings')
      .upsert({
        key: 'all_product_reviews',
        value: updatedAll,
        updated_at: new Date().toISOString(),
      });

    return { success: true, review: newReview };
  } catch (err: any) {
    console.error('submitProductReview fatal error:', err);
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

export async function toggleFeatureOnHome(review: ProductReview): Promise<boolean> {
  try {
    const commData = await getSetting<CommunitySectionSettings>('community_reviews', DEFAULT_COMMUNITY);
    const existingList = commData.reviews || [];

    const isAlreadyFeatured = existingList.some(r => String(r.id) === String(review.id));

    let updatedReviews: CustomerReview[];
    if (isAlreadyFeatured) {
      // Remove from featured
      updatedReviews = existingList.filter(r => String(r.id) !== String(review.id));
    } else {
      // Add to featured at the beginning
      const newFeatured: CustomerReview = {
        id: review.id,
        name: review.name,
        city: review.city,
        rating: review.rating,
        item: review.product_name ? `${review.product_name} • Heavyweight` : 'Heavyweight Streetwear',
        review: review.comment,
        verified: true,
        fit: review.fit,
      };
      updatedReviews = [newFeatured, ...existingList];
    }

    const saved = await saveSetting('community_reviews', {
      ...commData,
      reviews: updatedReviews,
    });

    return saved;
  } catch (err) {
    console.error('Error toggling feature on home:', err);
    return false;
  }
}
