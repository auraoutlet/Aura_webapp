'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, calculateDiscountPercentage, cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { useWishlistStore, useHydration } from '@/lib/store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isHydrated = useHydration();
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const discount = product.sale_price 
    ? calculateDiscountPercentage(product.base_price, product.sale_price) 
    : 0;

  return (
    <div className="group relative flex flex-col card-hover">
      <Link href={`/products/${product.slug}`} className="flex flex-col relative w-full aspect-[3/4] bg-off-white overflow-hidden mb-3.5 block border border-border">
        {/* Image */}
        <div className="w-full h-full bg-off-white group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-gray">
          {product.images && product.images.length > 0 && product.images[0].image_url ? (
            <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs uppercase tracking-widest text-gray font-bold">AURA OUTLET</span>
          )}
        </div>
        
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-black text-white border-black text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-none shadow-sm">
              -{discount}%
            </Badge>
          </div>
        )}
      </Link>
      
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="group/wish absolute top-3 right-3 z-10 p-2.5 bg-white rounded-full shadow-md hover:bg-black transition-all border border-border"
        aria-label={isHydrated && isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          size={18} 
          className={cn(
            "transition-colors",
            isHydrated && isWishlisted 
              ? "fill-black text-black group-hover/wish:fill-white group-hover/wish:text-white" 
              : "text-black group-hover/wish:text-white"
          )} 
        />
      </button>

      <Link href={`/products/${product.slug}`} className="flex flex-col flex-1 block">
        {product.category && (
          <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray mb-1.5">{product.category.name}</span>
        )}
        <h3 className="text-base md:text-lg font-bold text-black line-clamp-1 mb-2 group-hover:underline">{product.name}</h3>
        <div className="flex items-center gap-3 mt-auto">
          {product.sale_price ? (
            <>
              <span className="text-base md:text-lg font-black text-black">{formatPrice(product.sale_price)}</span>
              <span className="text-sm md:text-base text-gray line-through font-medium">{formatPrice(product.base_price)}</span>
            </>
          ) : (
            <span className="text-base md:text-lg font-black text-black">{formatPrice(product.base_price)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
