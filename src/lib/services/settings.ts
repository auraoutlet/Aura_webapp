import { createClient } from '@/lib/supabase/client';

export interface HeroBannerSettings {
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
}

export interface PromoDropBannerSettings {
  isEnabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  specs: Array<{ title: string; desc: string }>;
}

export interface WhyAuraSettings {
  tag: string;
  title: string;
  features: Array<{ title: string; desc: string }>;
}

export interface CustomerReview {
  id: string | number;
  name: string;
  city: string;
  rating: number;
  item: string;
  review: string;
  verified: boolean;
  fit: string;
}

export interface CommunitySectionSettings {
  tag: string;
  title: string;
  subtitle: string;
  instagramHandle: string;
  instagramUrl: string;
  reviews: CustomerReview[];
}

export interface AnnouncementBarSettings {
  isEnabled: boolean;
  text: string;
}

export interface AdvertisementWidgetSettings {
  isEnabled: boolean;
  tag: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  productIds: string[]; // List of advertised product IDs or slugs
  layout: 'grid' | 'carousel';
}

export interface PolicyPagesSettings {
  aboutStoryTitle: string;
  aboutStorySubtitle: string;
  aboutStoryText: string;
  aboutPhilosophyText: string;
  contactEmail: string;
  contactPhone: string;
  contactInstagram: string;
  contactAddress: string;
  contactHours: string;
  shippingPolicyText: string;
  returnPolicyText: string;
  privacyPolicyText: string;
}

export const DEFAULT_ADVERTISEMENT_WIDGET: AdvertisementWidgetSettings = {
  isEnabled: true,
  tag: 'Curated Streetwear Picks',
  title: 'Top Highlights',
  subtitle: 'Handpicked heavyweights engineered for structural drape and longevity.',
  badge: 'TOP HIGHLIGHTS',
  buttonText: 'View All Designs',
  buttonLink: '/shop',
  productIds: [],
  layout: 'grid',
};

export const DEFAULT_POLICY_PAGES: PolicyPagesSettings = {
  aboutStoryTitle: 'Heavyweight Monochrome Streetwear',
  aboutStorySubtitle: 'The Brand Story',
  aboutStoryText: 'Redefining contemporary Indian streetwear through elevated oversized cuts, 240+ GSM dense cotton, and an uncompromising monochrome aesthetic.',
  aboutPhilosophyText: 'At AURA OUTLET, we construct clothing with structural weight and purpose. Every silhouette is intentionally designed with boxy proportions, drop shoulders, and reinforced sag-proof neck ribs.',
  contactEmail: 'support@auraoutlet.com',
  contactPhone: '+91 83009 48486',
  contactInstagram: '@aura.outlet._',
  contactAddress: 'Salem, Tamil Nadu, India',
  contactHours: 'Mon – Sat: 9:00 AM – 8:00 PM IST',
  shippingPolicyText: 'Orders dispatch within 24-48 business hours across India. Prepaid orders enjoy express air transit (2-4 days). Cash on Delivery orders require ₹200 advance confirmation with ₹150 delivery & handling charges.',
  returnPolicyText: 'We offer a 7-day hassle-free doorstep replacement or return policy for unused, unwashed items in their original brand packaging with all tags attached.',
  privacyPolicyText: 'AURA OUTLET respects your privacy. We strictly secure customer contact and transaction information and never sell or disclose your personal data to unauthorized third parties.',
};

export interface HomePageSectionsSettings {
  showCategories: boolean;
  categoriesTag: string;
  categoriesTitle: string;
  showFeatured: boolean;
  featuredTag: string;
  featuredTitle: string;
}

export interface InstagramSettings {
  handle: string;
  isEnabled: boolean;
  images: string[];
}

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarSettings = {
  isEnabled: true,
  text: 'FREE SHIPPING ON ORDERS ABOVE ₹999',
};

export const DEFAULT_HERO_BANNER: HeroBannerSettings = {
  badge: 'NEW DROP 2026',
  title: 'REDEFINE\nYOUR STYLE',
  subtitle: 'Premium heavyweight streetwear engineered for those who dare to stand out. Bold. Modern. Minimal.',
  imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
  primaryBtnText: 'Shop Now',
  primaryBtnLink: '/shop',
  secondaryBtnText: 'View Collections',
  secondaryBtnLink: '/collections',
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomePageSectionsSettings = {
  showCategories: true,
  categoriesTag: 'Explore Silhouettes',
  categoriesTitle: 'Shop by Category',
  showFeatured: true,
  featuredTag: 'Handpicked Heavyweights',
  featuredTitle: 'Featured Collection',
};

export const DEFAULT_PROMO_BANNER: PromoDropBannerSettings = {
  isEnabled: true,
  badge: 'Limited Edition Drop',
  title: 'Drop 01 — Now Available',
  subtitle: 'Exclusive 240+ GSM dense cotton heavyweights engineered for structural drape and longevity. Limited batch produced. Once sold out, never restocked.',
  buttonText: 'Shop The Drop',
  buttonLink: '/shop',
  imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=80',
  specs: [
    { title: '240+ GSM', desc: 'Combed Heavy Cotton' },
    { title: 'Boxy Silhouette', desc: 'Relaxed Drop Shoulder' },
    { title: 'Pre-Shrunk', desc: 'Zero Wash Distortion' },
    { title: 'Reinforced Rib', desc: 'Sag-Proof 1.25" Collar' },
  ],
};

export const DEFAULT_WHY_AURA: WhyAuraSettings = {
  tag: 'Quality Meets Style',
  title: 'Why AURA OUTLET',
  features: [
    {
      title: 'Premium Quality',
      desc: '240+ GSM combed heavyweight cotton for structural drape',
    },
    {
      title: 'Free Shipping',
      desc: 'Complimentary shipping on orders above ₹999 across India',
    },
    {
      title: 'Easy Returns',
      desc: '7-day hassle-free doorstep returns & size exchanges',
    },
    {
      title: 'Secure Payments',
      desc: '100% encrypted checkout via Cashfree UPI & Cards',
    },
  ],
};

export const DEFAULT_COMMUNITY: CommunitySectionSettings = {
  tag: '@aura.outlet._ • Fit Check',
  title: 'What Our Community Says',
  subtitle: 'Real fits. Real verified reviews. Tag us in your fits #AuraOutlet and get featured.',
  instagramHandle: '@aura.outlet._',
  instagramUrl: 'https://www.instagram.com/aura.outlet._/',
  reviews: [
    {
      id: 1,
      name: 'Arjun M.',
      city: 'Bangalore',
      rating: 5,
      item: 'Oversized Heavyweight Tee • Black',
      review: 'The 240+ GSM fabric weight is insane. The collar stays crisp after multiple washes, and the boxy drop-shoulder silhouette fits exactly like luxury streetwear.',
      verified: true,
      fit: 'True to oversized fit',
    },
    {
      id: 2,
      name: 'Rohit S.',
      city: 'Mumbai',
      rating: 5,
      item: 'Drop 01 Signature Heavyweight • Charcoal',
      review: 'Finally an Indian streetwear label getting the density and silhouette right. Zero shrinkage after wash and the fabric feels substantial and premium.',
      verified: true,
      fit: 'Perfect structural drape',
    },
    {
      id: 3,
      name: 'Kavya N.',
      city: 'Chennai',
      rating: 5,
      item: 'Aura Minimal Heavyweight • Off-White',
      review: 'Dense yet breathable cotton. You can immediately feel the quality difference compared to standard tees. Clean minimalist branding is top-tier.',
      verified: true,
      fit: 'Clean boxy silhouette',
    },
  ],
};

export const DEFAULT_INSTAGRAM: InstagramSettings = {
  handle: '@aura.outlet._',
  isEnabled: true,
  images: [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
  ],
};

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) {
      return defaultValue;
    }

    return (data.value as T) ?? defaultValue;
  } catch (err) {
    console.warn(`Error fetching setting ${key}:`, err);
    return defaultValue;
  }
}

export async function saveSetting(key: string, value: any): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`Error saving setting ${key}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Exception saving setting ${key}:`, err);
    return false;
  }
}
