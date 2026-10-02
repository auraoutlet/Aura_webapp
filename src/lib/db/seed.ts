import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

async function seed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1, ssl: 'require' });
  const db = drizzle(sql, { schema });

  console.log('🌱 Seeding initial AURA OUTLET catalog (No Hoodies)...');

  try {
    // 1. Categories
    console.log('Inserting categories...');
    await db.insert(schema.categories).values([
      {
        id: 'cat-1',
        name: 'Oversized T-Shirts',
        slug: 'oversized-t-shirts',
        description: 'Heavyweight 240+ GSM dropped shoulder streetwear tees engineered for ultimate comfort.',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
      },
      {
        id: 'cat-2',
        name: 'Graphic T-Shirts',
        slug: 'graphic-t-shirts',
        description: 'High-density screen prints and bold contemporary visual typography.',
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
      },
      {
        id: 'cat-3',
        name: 'Heavyweight Basics',
        slug: 'heavyweight-basics',
        description: 'Minimalist, luxury-grade solid essentials tailored from combed cotton.',
        imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
      },
      {
        id: 'cat-4',
        name: 'Acid Wash Collection',
        slug: 'acid-wash',
        description: 'Vintage mineral washed oversized tees with distressed artisanal finishing.',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
      },
    ]).onConflictDoNothing();

    // 2. Products
    console.log('Inserting products...');
    await db.insert(schema.products).values([
      {
        id: 'prod-1',
        name: 'OVERSIZED MONOCHROME GRAPHIC TEE',
        slug: 'oversized-monochrome-graphic-tee',
        description: '260 GSM combed cotton featuring high-density typography print on front and back. Dropped shoulder boxy silhouette engineered in Tirupur, India.',
        categoryId: 'cat-2',
        basePrice: '1499.00',
        salePrice: '999.00',
        brand: 'AURA OUTLET',
        isActive: true,
        isFeatured: true,
      },
      {
        id: 'prod-2',
        name: 'HEAVYWEIGHT BOX-FIT PLAIN TEE',
        slug: 'heavyweight-box-fit-plain-tee',
        description: '240 GSM luxury plain heavyweight crewneck. Clean ribbed collar, double-needle stitched cuffs and hem. The purest monochrome basic.',
        categoryId: 'cat-3',
        basePrice: '1299.00',
        salePrice: '899.00',
        brand: 'AURA OUTLET',
        isActive: true,
        isFeatured: true,
      },
      {
        id: 'prod-3',
        name: 'ACID WASH VINTAGE OVERSIZED TEE',
        slug: 'acid-wash-vintage-oversized-tee',
        description: 'Artisanal mineral washed 250 GSM cotton. Each piece features a unique vintage distressed finish with silicone softening wash.',
        categoryId: 'cat-4',
        basePrice: '1699.00',
        salePrice: '1199.00',
        brand: 'AURA OUTLET',
        isActive: true,
        isFeatured: true,
      },
      {
        id: 'prod-4',
        name: 'CYBERPUNK DISTRESSED OVERSIZED TEE',
        slug: 'cyberpunk-distressed-oversized-tee',
        description: 'Futuristic cyberpunk artwork screenprinted with fade-resistant eco plastisol ink. Raw-edge dropped shoulder cut.',
        categoryId: 'cat-2',
        basePrice: '1599.00',
        salePrice: '1099.00',
        brand: 'AURA OUTLET',
        isActive: true,
        isFeatured: false,
      },
      {
        id: 'prod-5',
        name: 'SIGNATURE AURA BOX LOGO TEE',
        slug: 'signature-aura-box-logo-tee',
        description: 'Signature minimal AURA OUTLET branding on chest. 240 GSM combed cotton with pre-shrunk treatment for lifetime fit.',
        categoryId: 'cat-1',
        basePrice: '1399.00',
        salePrice: '899.00',
        brand: 'AURA OUTLET',
        isActive: true,
        isFeatured: true,
      },
      {
        id: 'prod-6',
        name: 'DARK AURA ACID WASHED RAW TEE',
        slug: 'dark-aura-acid-washed-raw-tee',
        description: 'Charcoal acid washed streetwear staple. Oversized boxy silhouette, reinforced neck binding, breathable luxury knit.',
        categoryId: 'cat-4',
        basePrice: '1799.00',
        salePrice: '1299.00',
        brand: 'AURA OUTLET',
        isActive: true,
        isFeatured: false,
      },
    ]).onConflictDoNothing();

    // 3. Product Variants
    console.log('Inserting variants...');
    await db.insert(schema.productVariants).values([
      { id: 'var-1-s', productId: 'prod-1', size: 'S', color: 'Black', sku: 'AURA-MONO-S-BLK', price: '999.00', stockQuantity: 15, isActive: true },
      { id: 'var-1-m', productId: 'prod-1', size: 'M', color: 'Black', sku: 'AURA-MONO-M-BLK', price: '999.00', stockQuantity: 25, isActive: true },
      { id: 'var-1-l', productId: 'prod-1', size: 'L', color: 'Black', sku: 'AURA-MONO-L-BLK', price: '999.00', stockQuantity: 20, isActive: true },
      { id: 'var-1-xl', productId: 'prod-1', size: 'XL', color: 'Black', sku: 'AURA-MONO-XL-BLK', price: '999.00', stockQuantity: 12, isActive: true },

      { id: 'var-2-s', productId: 'prod-2', size: 'S', color: 'Off-White', sku: 'AURA-HW-S-WHT', price: '899.00', stockQuantity: 10, isActive: true },
      { id: 'var-2-m', productId: 'prod-2', size: 'M', color: 'Off-White', sku: 'AURA-HW-M-WHT', price: '899.00', stockQuantity: 30, isActive: true },
      { id: 'var-2-l', productId: 'prod-2', size: 'L', color: 'Off-White', sku: 'AURA-HW-L-WHT', price: '899.00', stockQuantity: 25, isActive: true },
      { id: 'var-2-xl', productId: 'prod-2', size: 'XL', color: 'Off-White', sku: 'AURA-HW-XL-WHT', price: '899.00', stockQuantity: 15, isActive: true },

      { id: 'var-3-s', productId: 'prod-3', size: 'S', color: 'Mineral Grey', sku: 'AURA-ACID-S-GRY', price: '1199.00', stockQuantity: 8, isActive: true },
      { id: 'var-3-m', productId: 'prod-3', size: 'M', color: 'Mineral Grey', sku: 'AURA-ACID-M-GRY', price: '1199.00', stockQuantity: 18, isActive: true },
      { id: 'var-3-l', productId: 'prod-3', size: 'L', color: 'Mineral Grey', sku: 'AURA-ACID-L-GRY', price: '1199.00', stockQuantity: 14, isActive: true },
      { id: 'var-3-xl', productId: 'prod-3', size: 'XL', color: 'Mineral Grey', sku: 'AURA-ACID-XL-GRY', price: '1199.00', stockQuantity: 6, isActive: true },

      { id: 'var-4-m', productId: 'prod-4', size: 'M', color: 'Black', sku: 'AURA-CYBER-M-BLK', price: '1099.00', stockQuantity: 15, isActive: true },
      { id: 'var-4-l', productId: 'prod-4', size: 'L', color: 'Black', sku: 'AURA-CYBER-L-BLK', price: '1099.00', stockQuantity: 20, isActive: true },
      { id: 'var-4-xl', productId: 'prod-4', size: 'XL', color: 'Black', sku: 'AURA-CYBER-XL-BLK', price: '1099.00', stockQuantity: 10, isActive: true },

      { id: 'var-5-s', productId: 'prod-5', size: 'S', color: 'Black', sku: 'AURA-LOGO-S-BLK', price: '899.00', stockQuantity: 20, isActive: true },
      { id: 'var-5-m', productId: 'prod-5', size: 'M', color: 'Black', sku: 'AURA-LOGO-M-BLK', price: '899.00', stockQuantity: 35, isActive: true },
      { id: 'var-5-l', productId: 'prod-5', size: 'L', color: 'Black', sku: 'AURA-LOGO-L-BLK', price: '899.00', stockQuantity: 25, isActive: true },
      { id: 'var-5-xl', productId: 'prod-5', size: 'XL', color: 'Black', sku: 'AURA-LOGO-XL-BLK', price: '899.00', stockQuantity: 18, isActive: true },

      { id: 'var-6-m', productId: 'prod-6', size: 'M', color: 'Charcoal', sku: 'AURA-DARK-M-CHR', price: '1299.00', stockQuantity: 12, isActive: true },
      { id: 'var-6-l', productId: 'prod-6', size: 'L', color: 'Charcoal', sku: 'AURA-DARK-L-CHR', price: '1299.00', stockQuantity: 15, isActive: true },
      { id: 'var-6-xl', productId: 'prod-6', size: 'XL', color: 'Charcoal', sku: 'AURA-DARK-XL-CHR', price: '1299.00', stockQuantity: 8, isActive: true },
    ]).onConflictDoNothing();

    // 4. Product Images
    console.log('Inserting images...');
    await db.insert(schema.productImages).values([
      { id: 'img-1-1', productId: 'prod-1', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', altText: 'Front View', sortOrder: 0, isPrimary: true },
      { id: 'img-1-2', productId: 'prod-1', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80', altText: 'Back Graphic Detail', sortOrder: 1, isPrimary: false },
      { id: 'img-2-1', productId: 'prod-2', imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80', altText: 'Minimal Front', sortOrder: 0, isPrimary: true },
      { id: 'img-3-1', productId: 'prod-3', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', altText: 'Vintage Acid Wash', sortOrder: 0, isPrimary: true },
      { id: 'img-4-1', productId: 'prod-4', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', altText: 'Cyberpunk Detail', sortOrder: 0, isPrimary: true },
      { id: 'img-5-1', productId: 'prod-5', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80', altText: 'Signature Aura Box Logo', sortOrder: 0, isPrimary: true },
      { id: 'img-6-1', productId: 'prod-6', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', altText: 'Charcoal Heavy Raw Tee', sortOrder: 0, isPrimary: true },
    ]).onConflictDoNothing();

    // 5. Coupons
    console.log('Inserting coupons...');
    await db.insert(schema.coupons).values([
      { id: 'coup-1', code: 'AURA10', description: '10% off on all streetwear orders', discountType: 'percentage', discountValue: '10.00', minimumOrderValue: '999.00', maximumDiscount: '500.00', usageLimit: 500, usedCount: 12, isActive: true },
      { id: 'coup-2', code: 'WELCOME50', description: 'Flat ₹50 off on first purchase', discountType: 'fixed', discountValue: '50.00', minimumOrderValue: '499.00', maximumDiscount: null, usageLimit: 1000, usedCount: 35, isActive: true },
      { id: 'coup-3', code: 'HEAVY200', description: 'Special ₹200 discount on cart value above ₹1999', discountType: 'fixed', discountValue: '200.00', minimumOrderValue: '1999.00', maximumDiscount: '200.00', usageLimit: 200, usedCount: 8, isActive: true },
    ]).onConflictDoNothing();

    // 6. Settings
    console.log('Inserting settings...');
    await db.insert(schema.storeSettings).values([
      { key: 'store_profile', value: { name: 'AURA OUTLET', tagline: 'Quality Meets Style', support_email: 'support@auraoutlet.com', support_phone: '+91 98765 43210', city: 'Tirupur, Tamil Nadu' } },
      { key: 'shipping_rules', value: { free_shipping_threshold: 999, standard_shipping_fee: 99, return_days: 7 } },
      { key: 'social_links', value: { instagram: 'https://www.instagram.com/aura.outlet._/' } },
    ]).onConflictDoNothing();

    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await sql.end();
  }
}

seed();
