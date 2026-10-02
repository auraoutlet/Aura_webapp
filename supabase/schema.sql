-- ====================================================================
-- AURA OUTLET — COMPLETE SUPABASE DATABASE SCHEMA & SEED SCRIPT
-- ====================================================================
-- Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom Enums (Safe create)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 3. TABLES
-- ====================================================================

-- PROFILES (Maps to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Valued Customer',
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    brand TEXT NOT NULL DEFAULT 'AURA OUTLET',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRODUCT VARIANTS (Size, Color, SKU, Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    order_status order_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PAYMENTS (Cashfree integration)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    cashfree_order_id TEXT,
    payment_session_id TEXT,
    transaction_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL,
    minimum_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    maximum_discount NUMERIC(10, 2),
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COUPON USAGES
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id TEXT PRIMARY KEY,
    coupon_id TEXT NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Public READ access for storefront
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public Read Product Images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Public Read Store Settings" ON public.store_settings FOR SELECT USING (true);

-- Admin & API Full Write Access (Allows admin screens to insert/update/delete)
CREATE POLICY "Admin Full Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Product Images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- User Profiles & Addresses & Wishlists
CREATE POLICY "Users read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users manage addresses" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users manage wishlist" ON public.wishlist_items FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 5. STORAGE BUCKETS SETUP (For Product & Category Images)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS
CREATE POLICY "Public Access Products Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public Upload Products Bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
CREATE POLICY "Public Update Products Bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'products');
CREATE POLICY "Public Delete Products Bucket" ON storage.objects FOR DELETE USING (bucket_id = 'products');

CREATE POLICY "Public Access Categories Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Public Upload Categories Bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');

-- ====================================================================
-- 6. SEED DATA (AURA OUTLET Initial Catalog — NO HOODIES)
-- ====================================================================

-- Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active) VALUES
('cat-1', 'Oversized T-Shirts', 'oversized-t-shirts', 'Heavyweight 240+ GSM dropped shoulder streetwear tees engineered for ultimate comfort.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', true),
('cat-2', 'Graphic T-Shirts', 'graphic-t-shirts', 'High-density screen prints and bold contemporary visual typography.', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80', true),
('cat-3', 'Heavyweight Basics', 'heavyweight-basics', 'Minimalist, luxury-grade solid essentials tailored from combed cotton.', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80', true),
('cat-4', 'Acid Wash Collection', 'acid-wash', 'Vintage mineral washed oversized tees with distressed artisanal finishing.', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', true)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
slug = EXCLUDED.slug,
description = EXCLUDED.description,
image_url = EXCLUDED.image_url;

-- Products
INSERT INTO public.products (id, name, slug, description, category_id, base_price, sale_price, brand, is_active, is_featured) VALUES
('prod-1', 'OVERSIZED MONOCHROME GRAPHIC TEE', 'oversized-monochrome-graphic-tee', '260 GSM combed cotton featuring high-density typography print on front and back. Dropped shoulder boxy silhouette engineered in Tirupur, India.', 'cat-2', 1499, 999, 'AURA OUTLET', true, true),
('prod-2', 'HEAVYWEIGHT BOX-FIT PLAIN TEE', 'heavyweight-box-fit-plain-tee', '240 GSM luxury plain heavyweight crewneck. Clean ribbed collar, double-needle stitched cuffs and hem. The purest monochrome basic.', 'cat-3', 1299, 899, 'AURA OUTLET', true, true),
('prod-3', 'ACID WASH VINTAGE OVERSIZED TEE', 'acid-wash-vintage-oversized-tee', 'Artisanal mineral washed 250 GSM cotton. Each piece features a unique vintage distressed finish with silicone softening wash.', 'cat-4', 1699, 1199, 'AURA OUTLET', true, true),
('prod-4', 'CYBERPUNK DISTRESSED OVERSIZED TEE', 'cyberpunk-distressed-oversized-tee', 'Futuristic cyberpunk artwork screenprinted with fade-resistant eco plastisol ink. Raw-edge dropped shoulder cut.', 'cat-2', 1599, 1099, 'AURA OUTLET', true, false),
('prod-5', 'SIGNATURE AURA BOX LOGO TEE', 'signature-aura-box-logo-tee', 'Signature minimal AURA OUTLET branding on chest. 240 GSM combed cotton with pre-shrunk treatment for lifetime fit.', 'cat-1', 1399, 899, 'AURA OUTLET', true, true),
('prod-6', 'DARK AURA ACID WASHED RAW TEE', 'dark-aura-acid-washed-raw-tee', 'Charcoal acid washed streetwear staple. Oversized boxy silhouette, reinforced neck binding, breathable luxury knit.', 'cat-4', 1799, 1299, 'AURA OUTLET', true, false)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
slug = EXCLUDED.slug,
description = EXCLUDED.description,
category_id = EXCLUDED.category_id,
base_price = EXCLUDED.base_price,
sale_price = EXCLUDED.sale_price;

-- Product Variants
INSERT INTO public.product_variants (id, product_id, size, color, sku, price, stock_quantity, is_active) VALUES
-- Prod 1
('var-1-s', 'prod-1', 'S', 'Black', 'AURA-MONO-S-BLK', 999, 15, true),
('var-1-m', 'prod-1', 'M', 'Black', 'AURA-MONO-M-BLK', 999, 25, true),
('var-1-l', 'prod-1', 'L', 'Black', 'AURA-MONO-L-BLK', 999, 20, true),
('var-1-xl', 'prod-1', 'XL', 'Black', 'AURA-MONO-XL-BLK', 999, 12, true),
-- Prod 2
('var-2-s', 'prod-2', 'S', 'Off-White', 'AURA-HW-S-WHT', 899, 10, true),
('var-2-m', 'prod-2', 'M', 'Off-White', 'AURA-HW-M-WHT', 899, 30, true),
('var-2-l', 'prod-2', 'L', 'Off-White', 'AURA-HW-L-WHT', 899, 25, true),
('var-2-xl', 'prod-2', 'XL', 'Off-White', 'AURA-HW-XL-WHT', 899, 15, true),
-- Prod 3
('var-3-s', 'prod-3', 'S', 'Mineral Grey', 'AURA-ACID-S-GRY', 1199, 8, true),
('var-3-m', 'prod-3', 'M', 'Mineral Grey', 'AURA-ACID-M-GRY', 1199, 18, true),
('var-3-l', 'prod-3', 'L', 'Mineral Grey', 'AURA-ACID-L-GRY', 1199, 14, true),
('var-3-xl', 'prod-3', 'XL', 'Mineral Grey', 'AURA-ACID-XL-GRY', 1199, 6, true),
-- Prod 4
('var-4-m', 'prod-4', 'M', 'Black', 'AURA-CYBER-M-BLK', 1099, 15, true),
('var-4-l', 'prod-4', 'L', 'Black', 'AURA-CYBER-L-BLK', 1099, 20, true),
('var-4-xl', 'prod-4', 'XL', 'Black', 'AURA-CYBER-XL-BLK', 1099, 10, true),
-- Prod 5
('var-5-s', 'prod-5', 'S', 'Black', 'AURA-LOGO-S-BLK', 899, 20, true),
('var-5-m', 'prod-5', 'M', 'Black', 'AURA-LOGO-M-BLK', 899, 35, true),
('var-5-l', 'prod-5', 'L', 'Black', 'AURA-LOGO-L-BLK', 899, 25, true),
('var-5-xl', 'prod-5', 'XL', 'Black', 'AURA-LOGO-XL-BLK', 899, 18, true),
-- Prod 6
('var-6-m', 'prod-6', 'M', 'Charcoal', 'AURA-DARK-M-CHR', 1299, 12, true),
('var-6-l', 'prod-6', 'L', 'Charcoal', 'AURA-DARK-L-CHR', 1299, 15, true),
('var-6-xl', 'prod-6', 'XL', 'Charcoal', 'AURA-DARK-XL-CHR', 1299, 8, true)
ON CONFLICT (id) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES
('img-1-1', 'prod-1', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', 'Front View', 0, true),
('img-1-2', 'prod-1', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80', 'Back Graphic Detail', 1, false),
('img-2-1', 'prod-2', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80', 'Minimal Front', 0, true),
('img-3-1', 'prod-3', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', 'Vintage Acid Wash', 0, true),
('img-4-1', 'prod-4', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', 'Cyberpunk Detail', 0, true),
('img-5-1', 'prod-5', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80', 'Signature Aura Box Logo', 0, true),
('img-6-1', 'prod-6', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', 'Charcoal Heavy Raw Tee', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Coupons
INSERT INTO public.coupons (id, code, description, discount_type, discount_value, minimum_order_value, maximum_discount, usage_limit, used_count, is_active, expires_at) VALUES
('coup-1', 'AURA10', '10% off on all streetwear orders', 'percentage', 10, 999, 500, 500, 12, true, now() + interval '90 days'),
('coup-2', 'WELCOME50', 'Flat ₹50 off on first purchase', 'fixed', 50, 499, NULL, 1000, 35, true, now() + interval '180 days'),
('coup-3', 'HEAVY200', 'Special ₹200 discount on cart value above ₹1999', 'fixed', 200, 1999, 200, 200, 8, true, now() + interval '60 days')
ON CONFLICT (id) DO NOTHING;

-- Store Settings
INSERT INTO public.store_settings (key, value) VALUES
('store_profile', '{"name": "AURA OUTLET", "tagline": "Quality Meets Style", "support_email": "support@auraoutlet.com", "support_phone": "+91 98765 43210", "city": "Tirupur, Tamil Nadu"}'::jsonb),
('shipping_rules', '{"free_shipping_threshold": 999, "standard_shipping_fee": 99, "return_days": 7}'::jsonb),
('social_links', '{"instagram": "https://www.instagram.com/aura.outlet._/"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Done!
SELECT 'AURA OUTLET schema created and seeded successfully!' AS status;
