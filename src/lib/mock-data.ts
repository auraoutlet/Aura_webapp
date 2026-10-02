import type {
  Product,
  Category,
  ProductVariant,
  ProductImage,
  CartItem,
  Address,
  Order,
  WishlistItem,
  Coupon,
  Profile,
  DashboardStats,
  FilterOptions,
} from './types';

// ============================================
// Mock Categories
// ============================================
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Premium quality t-shirts crafted for everyday comfort and style.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_count: 12,
  },
  {
    id: 'cat-2',
    name: 'Oversized',
    slug: 'oversized',
    description: 'Relaxed fit oversized tees for the bold streetwear look.',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_count: 8,
  },
  {
    id: 'cat-3',
    name: 'Graphic Tees',
    slug: 'graphic-tees',
    description: 'Statement graphic tees with bold prints and unique designs.',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_count: 10,
  },
  {
    id: 'cat-4',
    name: 'Polo Shirts',
    slug: 'polo-shirts',
    description: 'Classic polo shirts for a smart casual look.',
    image_url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_count: 6,
  },
];

// Product Image Map for realistic streetwear/fashion mock images
const mockProductImagesMap: Record<string, { front: string; back: string }> = {
  'prod-1': {
    front: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-2': {
    front: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-3': {
    front: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-4': {
    front: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1625910513413-5fc55c65f949?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-5': {
    front: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-6': {
    front: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-7': {
    front: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
  },
  'prod-8': {
    front: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
  },
};

// ============================================
// Mock Product Images
// ============================================
function createMockImages(productId: string): ProductImage[] {
  const images = mockProductImagesMap[productId] || {
    front: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    back: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
  };

  return [
    {
      id: `img-${productId}-1`,
      product_id: productId,
      image_url: images.front,
      alt_text: 'Front view',
      sort_order: 0,
      is_primary: true,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: `img-${productId}-2`,
      product_id: productId,
      image_url: images.back,
      alt_text: 'Back view',
      sort_order: 1,
      is_primary: false,
      created_at: '2025-01-01T00:00:00Z',
    },
  ];
}

// ============================================
// Mock Product Variants
// ============================================
function createMockVariants(
  productId: string,
  basePrice: number,
  color: string = 'Black'
): ProductVariant[] {
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const stocks = [5, 10, 15, 8, 3];
  return sizes.map((size, i) => ({
    id: `var-${productId}-${size.toLowerCase()}`,
    product_id: productId,
    size,
    color,
    sku: `AO-${productId.toUpperCase()}-${color.toUpperCase()}-${size}`,
    price: basePrice,
    stock_quantity: stocks[i],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }));
}

// ============================================
// Mock Products
// ============================================
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Oversized Black Dragon Tee',
    slug: 'oversized-black-dragon-tee',
    description:
      'A bold oversized t-shirt featuring an intricate dragon print. Made from premium 240 GSM cotton for a heavyweight feel. The relaxed drop-shoulder silhouette delivers authentic streetwear vibes.\n\n• 240 GSM heavyweight cotton\n• Drop shoulder design\n• Oversized relaxed fit\n• Ribbed crew neck\n• Pre-shrunk fabric',
    category_id: 'cat-2',
    base_price: 1499,
    sale_price: 1199,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: true,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
    category: mockCategories[1],
    variants: createMockVariants('prod-1', 1199),
    images: createMockImages('prod-1'),
  },
  {
    id: 'prod-2',
    name: 'Minimal White Essential Tee',
    slug: 'minimal-white-essential-tee',
    description:
      'The perfect essential white tee. Clean, minimal, and versatile. Crafted from soft 180 GSM combed cotton with a regular fit that works with everything.\n\n• 180 GSM combed cotton\n• Regular fit\n• Reinforced seams\n• Pre-washed for softness',
    category_id: 'cat-1',
    base_price: 899,
    sale_price: null,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: true,
    created_at: '2025-06-02T00:00:00Z',
    updated_at: '2025-06-02T00:00:00Z',
    category: mockCategories[0],
    variants: createMockVariants('prod-2', 899, 'White'),
    images: createMockImages('prod-2'),
  },
  {
    id: 'prod-3',
    name: 'Graphic Urban Skyline Tee',
    slug: 'graphic-urban-skyline-tee',
    description:
      'Urban-inspired graphic tee with a city skyline print. Perfect for street style enthusiasts who want to make a statement.\n\n• 200 GSM ring-spun cotton\n• High-quality screen print\n• Regular fit\n• Tagless comfort label',
    category_id: 'cat-3',
    base_price: 1299,
    sale_price: 999,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: true,
    created_at: '2025-06-03T00:00:00Z',
    updated_at: '2025-06-03T00:00:00Z',
    category: mockCategories[2],
    variants: createMockVariants('prod-3', 999),
    images: createMockImages('prod-3'),
  },
  {
    id: 'prod-4',
    name: 'Classic Black Polo',
    slug: 'classic-black-polo',
    description:
      'Timeless black polo shirt with a modern fit. Ideal for smart casual occasions.\n\n• 220 GSM pique cotton\n• Button placket\n• Ribbed collar and cuffs\n• Side vents for comfort',
    category_id: 'cat-4',
    base_price: 1599,
    sale_price: null,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: false,
    created_at: '2025-06-04T00:00:00Z',
    updated_at: '2025-06-04T00:00:00Z',
    category: mockCategories[3],
    variants: createMockVariants('prod-4', 1599),
    images: createMockImages('prod-4'),
  },
  {
    id: 'prod-5',
    name: 'Heavyweight Boxy Noir Tee',
    slug: 'heavyweight-boxy-noir-tee',
    description:
      'Premium heavyweight boxy streetwear tee in noir. Crafted from dense 260 GSM combed cotton for a clean, architectural drape.\n\n• 260 GSM combed heavyweight cotton\n• Boxy drop-shoulder silhouette\n• Thick ribbed crewneck\n• Pre-shrunk fabric',
    category_id: 'cat-2',
    base_price: 1599,
    sale_price: 1299,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: true,
    created_at: '2025-06-05T00:00:00Z',
    updated_at: '2025-06-05T00:00:00Z',
    category: mockCategories[1],
    variants: createMockVariants('prod-5', 1299),
    images: createMockImages('prod-5'),
  },
  {
    id: 'prod-6',
    name: 'Acid Wash Vintage Tee',
    slug: 'acid-wash-vintage-tee',
    description:
      'Retro-inspired acid wash t-shirt with a distressed finish. Each piece is unique.\n\n• 200 GSM cotton\n• Acid wash treatment\n• Relaxed fit\n• Vintage worn-in feel',
    category_id: 'cat-1',
    base_price: 1199,
    sale_price: 899,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: false,
    created_at: '2025-06-06T00:00:00Z',
    updated_at: '2025-06-06T00:00:00Z',
    category: mockCategories[0],
    variants: createMockVariants('prod-6', 899, 'Gray'),
    images: createMockImages('prod-6'),
  },
  {
    id: 'prod-7',
    name: 'Oversized Washed Olive Tee',
    slug: 'oversized-washed-olive-tee',
    description:
      'Oversized tee in washed olive with a soft garment-dyed finish.\n\n• 240 GSM cotton\n• Garment dyed\n• Oversized fit\n• Drop shoulder',
    category_id: 'cat-2',
    base_price: 1399,
    sale_price: null,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: false,
    created_at: '2025-06-07T00:00:00Z',
    updated_at: '2025-06-07T00:00:00Z',
    category: mockCategories[1],
    variants: createMockVariants('prod-7', 1399, 'Olive'),
    images: createMockImages('prod-7'),
  },
  {
    id: 'prod-8',
    name: 'Neon Skull Graphic Tee',
    slug: 'neon-skull-graphic-tee',
    description:
      'Eye-catching graphic tee with a neon skull design on black.\n\n• 200 GSM cotton\n• Glow-in-dark print\n• Regular fit\n• Crew neck',
    category_id: 'cat-3',
    base_price: 1299,
    sale_price: 1099,
    brand: 'AURA OUTLET',
    is_active: true,
    is_featured: false,
    created_at: '2025-06-08T00:00:00Z',
    updated_at: '2025-06-08T00:00:00Z',
    category: mockCategories[2],
    variants: [
      ...createMockVariants('prod-8', 1099),
      // Add an out-of-stock variant
      {
        id: 'var-prod-8-xs',
        product_id: 'prod-8',
        size: 'XS',
        color: 'Black',
        sku: 'AO-PROD-8-BLACK-XS',
        price: 1099,
        stock_quantity: 0,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ],
    images: createMockImages('prod-8'),
  },
];

// ============================================
// Mock Cart Items
// ============================================
export const mockCartItems: CartItem[] = [
  {
    id: 'ci-1',
    cart_id: 'cart-1',
    product_id: 'prod-1',
    variant_id: 'var-prod-1-m',
    quantity: 1,
    created_at: '2025-06-10T00:00:00Z',
    updated_at: '2025-06-10T00:00:00Z',
    product: mockProducts[0],
    variant: mockProducts[0].variants![1],
  },
  {
    id: 'ci-2',
    cart_id: 'cart-1',
    product_id: 'prod-5',
    variant_id: 'var-prod-5-l',
    quantity: 2,
    created_at: '2025-06-10T00:00:00Z',
    updated_at: '2025-06-10T00:00:00Z',
    product: mockProducts[4],
    variant: mockProducts[4].variants![2],
  },
];

// ============================================
// Mock Addresses
// ============================================
export const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    user_id: 'user-1',
    full_name: 'Shiva Kumar',
    phone: '+91 98765 43210',
    address_line_1: '42, MG Road, Indiranagar',
    address_line_2: 'Near Metro Station',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    landmark: 'Opposite Coffee Day',
    is_default: true,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'addr-2',
    user_id: 'user-1',
    full_name: 'Shiva Kumar',
    phone: '+91 98765 43210',
    address_line_1: '15, HSR Layout, Sector 2',
    address_line_2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560102',
    landmark: null,
    is_default: false,
    created_at: '2025-02-20T00:00:00Z',
    updated_at: '2025-02-20T00:00:00Z',
  },
];

// ============================================
// Mock Orders
// ============================================
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    order_number: 'AO-M1K2X3-A7B9',
    user_id: 'user-1',
    address_id: 'addr-1',
    subtotal: 5197,
    discount: 500,
    shipping_fee: 0,
    total_amount: 4697,
    payment_status: 'SUCCESS',
    order_status: 'DELIVERED',
    created_at: '2025-05-15T10:30:00Z',
    updated_at: '2025-05-20T14:00:00Z',
    address: mockAddresses[0],
    items: [
      {
        id: 'oi-1',
        order_id: 'order-1',
        product_id: 'prod-1',
        variant_id: 'var-prod-1-m',
        product_name: 'Oversized Black Dragon Tee',
        size: 'M',
        color: 'Black',
        quantity: 1,
        unit_price: 1199,
        total_price: 1199,
      },
      {
        id: 'oi-2',
        order_id: 'order-1',
        product_id: 'prod-5',
        variant_id: 'var-prod-5-l',
        product_name: 'Heavyweight Boxy Noir Tee',
        size: 'L',
        color: 'Black',
        quantity: 2,
        unit_price: 1999,
        total_price: 3998,
      },
    ],
  },
  {
    id: 'order-2',
    order_number: 'AO-N4P5Q6-C8D0',
    user_id: 'user-1',
    address_id: 'addr-1',
    subtotal: 999,
    discount: 0,
    shipping_fee: 49,
    total_amount: 1048,
    payment_status: 'SUCCESS',
    order_status: 'SHIPPED',
    created_at: '2025-06-08T16:45:00Z',
    updated_at: '2025-06-10T09:00:00Z',
    address: mockAddresses[0],
    items: [
      {
        id: 'oi-3',
        order_id: 'order-2',
        product_id: 'prod-3',
        variant_id: 'var-prod-3-xl',
        product_name: 'Graphic Urban Skyline Tee',
        size: 'XL',
        color: 'Black',
        quantity: 1,
        unit_price: 999,
        total_price: 999,
      },
    ],
  },
  {
    id: 'order-3',
    order_number: 'AO-R7S8T9-E1F2',
    user_id: 'user-1',
    address_id: 'addr-2',
    subtotal: 899,
    discount: 0,
    shipping_fee: 49,
    total_amount: 948,
    payment_status: 'PENDING',
    order_status: 'PENDING',
    created_at: '2025-06-12T12:00:00Z',
    updated_at: '2025-06-12T12:00:00Z',
    address: mockAddresses[1],
    items: [
      {
        id: 'oi-4',
        order_id: 'order-3',
        product_id: 'prod-6',
        variant_id: 'var-prod-6-s',
        product_name: 'Acid Wash Vintage Tee',
        size: 'S',
        color: 'Gray',
        quantity: 1,
        unit_price: 899,
        total_price: 899,
      },
    ],
  },
];

// ============================================
// Mock Wishlist
// ============================================
export const mockWishlist: WishlistItem[] = [
  {
    id: 'wish-1',
    user_id: 'user-1',
    product_id: 'prod-2',
    created_at: '2025-06-05T00:00:00Z',
    product: mockProducts[1],
  },
  {
    id: 'wish-2',
    user_id: 'user-1',
    product_id: 'prod-5',
    created_at: '2025-06-07T00:00:00Z',
    product: mockProducts[4],
  },
];

// ============================================
// Mock Coupons
// ============================================
export const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'AURA500',
    description: 'Flat ₹500 off on orders above ₹2000',
    discount_type: 'fixed',
    discount_value: 500,
    minimum_order_value: 2000,
    maximum_discount: 500,
    usage_limit: 100,
    used_count: 23,
    expires_at: '2025-12-31T23:59:59Z',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'coupon-2',
    code: 'FIRST20',
    description: '20% off on your first order',
    discount_type: 'percentage',
    discount_value: 20,
    minimum_order_value: 500,
    maximum_discount: 1000,
    usage_limit: null,
    used_count: 156,
    expires_at: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'coupon-3',
    code: 'SUMMER15',
    description: '15% off on all products',
    discount_type: 'percentage',
    discount_value: 15,
    minimum_order_value: 1000,
    maximum_discount: 750,
    usage_limit: 50,
    used_count: 50,
    expires_at: '2025-08-31T23:59:59Z',
    is_active: false,
    created_at: '2025-05-01T00:00:00Z',
  },
];

// ============================================
// Mock Profiles (for admin customer view)
// ============================================
export const mockCustomers: Profile[] = [
  {
    id: 'user-1',
    full_name: 'Shiva Kumar',
    phone: '+91 98765 43210',
    avatar_url: null,
    role: 'customer',
    email: 'shiva@example.com',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-06-10T00:00:00Z',
  },
  {
    id: 'user-2',
    full_name: 'Priya Sharma',
    phone: '+91 87654 32109',
    avatar_url: null,
    role: 'customer',
    email: 'priya@example.com',
    created_at: '2025-02-20T00:00:00Z',
    updated_at: '2025-06-08T00:00:00Z',
  },
  {
    id: 'user-3',
    full_name: 'Arjun Patel',
    phone: '+91 76543 21098',
    avatar_url: null,
    role: 'customer',
    email: 'arjun@example.com',
    created_at: '2025-03-10T00:00:00Z',
    updated_at: '2025-06-05T00:00:00Z',
  },
  {
    id: 'user-4',
    full_name: 'Neha Gupta',
    phone: null,
    avatar_url: null,
    role: 'customer',
    email: 'neha@example.com',
    created_at: '2025-04-01T00:00:00Z',
    updated_at: '2025-05-30T00:00:00Z',
  },
];

// ============================================
// Mock Dashboard Stats
// ============================================
export const mockDashboardStats: DashboardStats = {
  totalSales: 156780,
  totalOrders: 89,
  pendingOrders: 7,
  totalCustomers: 64,
  totalProducts: 24,
  lowStockProducts: 3,
};

// ============================================
// Mock Filter Options
// ============================================
export const mockFilterOptions: FilterOptions = {
  categories: mockCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c.product_count || 0,
  })),
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  colors: ['Black', 'White', 'Gray', 'Olive', 'Navy'],
  priceRange: { min: 499, max: 2999 },
};
