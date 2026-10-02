'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { SectionHeading, EmptyState, Button, Spinner } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore, useCartStore, useHydration } from '@/lib/store';

export default function WishlistPage() {
  const isHydrated = useHydration();
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  const handleAddToCart = (item: (typeof wishlistItems)[0]) => {
    if (!item.product) return;
    const defaultVariant = item.product.variants?.[0] || {
      id: `var-${item.product.id}-default`,
      product_id: item.product.id,
      size: 'M',
      color: 'Black',
      sku: `AO-${item.product.id}-M`,
      price: item.product.sale_price || item.product.base_price,
      stock_quantity: 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addToCart(item.product, defaultVariant, 1);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  if (!isHydrated) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="py-12 flex justify-center items-center">
        <EmptyState
          icon={Heart}
          title="YOUR WISHLIST IS EMPTY"
          description="You haven't saved any items yet. Start exploring our collections."
          actionLabel="DISCOVER PRODUCTS"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <SectionHeading title="YOUR WISHLIST" align="left" />
        <span className="text-gray text-sm uppercase tracking-wider">
          {wishlistItems.length} ITEM{wishlistItems.length !== 1 ? 'S' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 animate-stagger">
        {wishlistItems.map((item) => {
          const product = item.product;
          const defaultVariant = product?.variants?.[0];
          const price = product?.sale_price || product?.base_price || defaultVariant?.price || 0;
          const originalPrice = product?.sale_price ? product.base_price : null;
          const isAdded = !!addedItemIds[item.id];

          return (
            <div key={item.id} className="group flex flex-col relative card-hover">
              {/* Product Image Placeholder */}
              <div className="aspect-[3/4] bg-off-white w-full overflow-hidden relative mb-4 flex items-center justify-center">
                {product?.images && product.images.length > 0 && product.images[0].image_url ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-[10px] font-bold tracking-widest text-gray uppercase">AURA</span>
                )}

                {/* Overlay remove action */}
                <button
                  onClick={() => removeWishlistItem(item.product_id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white shadow-sm border border-border"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4 text-current" />
                </button>
              </div>

              <div className="flex flex-col space-y-1 mb-4 flex-grow">
                <Link
                  href={`/products/${product?.slug}`}
                  className="text-sm font-medium hover:underline line-clamp-1"
                >
                  {product?.name || 'Aura Item'}
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{formatPrice(price)}</span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-gray line-through text-xs">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant={isAdded ? 'primary' : 'outline'}
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isAdded ? 'ADDED ✓' : 'ADD TO CART'}</span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
