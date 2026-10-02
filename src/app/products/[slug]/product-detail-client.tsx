'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus, ChevronDown } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, calculateDiscountPercentage, cn } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';
import { useCartStore, useWishlistStore, useHydration } from '@/lib/store';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(product.images?.[0]?.image_url || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [addedToCart, setAddedToCart] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isHydrated = useHydration();

  const discount = product.sale_price 
    ? calculateDiscountPercentage(product.base_price, product.sale_price) 
    : 0;

  const sizes = product.variants?.map(v => v.size).filter((s, i, arr) => arr.indexOf(s) === i) || ['S', 'M', 'L', 'XL', 'XXL'];

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
      {/* Left: Images */}
      <div className="lg:w-1/2 flex flex-col gap-4">
        <div className="w-full aspect-[3/4] bg-off-white flex items-center justify-center relative">
          {selectedImage ? (
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <span className="text-xl font-bold tracking-[0.2em] text-black">AURA OUTLET</span>
              <span className="text-xs tracking-widest text-gray mt-2">PREMIUM STREETWEAR</span>
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-black text-white border-black text-sm px-3 py-1">
                -{discount}% OFF
              </Badge>
            </div>
          )}
        </div>
        
        {product.images && product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(img.image_url)}
                className={cn(
                  "w-20 h-24 shrink-0 bg-off-white border-2 flex items-center justify-center",
                  selectedImage === img.image_url ? "border-black" : "border-transparent"
                )}
              >
                {img.image_url ? (
                  <img src={img.image_url} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase font-bold text-gray">View {idx + 1}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div className="lg:w-1/2 flex flex-col">
        {product.category && (
          <div className="text-xs md:text-sm font-bold text-gray uppercase tracking-widest mb-2">
            {product.category.name}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
          {product.name}
        </h1>
        
        <div className="flex items-baseline gap-4 mb-8">
          {product.sale_price ? (
            <>
              <span className="text-3xl md:text-4xl font-black text-black">{formatPrice(product.sale_price)}</span>
              <span className="text-xl text-gray line-through font-medium">{formatPrice(product.base_price)}</span>
            </>
          ) : (
            <span className="text-3xl md:text-4xl font-black text-black">{formatPrice(product.base_price)}</span>
          )}
        </div>

        {/* Size Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-extrabold uppercase tracking-wider text-sm md:text-base">Select Size</span>
            <button className="text-xs md:text-sm text-gray underline font-semibold uppercase tracking-wider hover:text-black transition-colors">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={cn(
                  "w-14 h-14 md:w-16 md:h-16 border-2 flex items-center justify-center text-sm md:text-base font-extrabold transition-all",
                  selectedSize === size 
                    ? "border-black bg-black text-white" 
                    : sizeError 
                    ? "border-error text-error hover:border-black"
                    : "border-border text-black hover:border-black hover:bg-off-white"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="text-error text-xs md:text-sm font-bold uppercase tracking-wider mt-2.5">Please select a size to continue</p>
          )}
        </div>

        {/* Quantity */}
        <div className="mb-8">
          <span className="font-extrabold uppercase tracking-wider text-sm md:text-base block mb-4">Quantity</span>
          <div className="flex items-center border-2 border-border w-36 h-14">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-full flex items-center justify-center hover:bg-off-white transition-colors"
            >
              <Minus size={18} />
            </button>
            <div className="flex-1 flex items-center justify-center font-bold text-base md:text-lg">
              {quantity}
            </div>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-full flex items-center justify-center hover:bg-off-white transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3.5 mb-10">
          <Button 
            className="w-full h-16 text-base md:text-lg tracking-wider uppercase font-black"
            variant="primary"
            onClick={() => {
              if (!selectedSize) {
                setSizeError(true);
                return;
              }
              const variant = product.variants?.find(v => v.size === selectedSize) || {
                id: `var-${product.id}-${selectedSize.toLowerCase()}`,
                product_id: product.id,
                size: selectedSize,
                color: 'Black',
                sku: `AO-${product.id}-${selectedSize}`,
                price: product.sale_price ?? product.base_price,
                stock_quantity: 10,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              addToCart(product, variant, quantity);
              setAddedToCart(true);
              setTimeout(() => setAddedToCart(false), 2000);
            }}
          >
            {addedToCart ? '✓ ADDED TO CART' : 'ADD TO CART'}
          </Button>
          <div className="flex gap-3.5">
            <Button 
              className="flex-1 h-16 text-base md:text-lg tracking-wider uppercase font-black"
              variant="outline"
              onClick={() => {
                if (!selectedSize) {
                  setSizeError(true);
                  return;
                }
                const variant = product.variants?.find(v => v.size === selectedSize) || {
                  id: `var-${product.id}-${selectedSize.toLowerCase()}`,
                  product_id: product.id,
                  size: selectedSize,
                  color: 'Black',
                  sku: `AO-${product.id}-${selectedSize}`,
                  price: product.sale_price ?? product.base_price,
                  stock_quantity: 10,
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                addToCart(product, variant, quantity);
                router.push('/checkout');
              }}
            >
              Buy Now
            </Button>
            <button 
              onClick={() => toggleWishlist(product)}
              className="w-16 h-16 border-2 border-black flex items-center justify-center hover:bg-off-white transition-colors"
              aria-label={isHydrated && isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={26} className={cn(isHydrated && isWishlisted ? "fill-black text-black" : "text-black")} />
            </button>
          </div>
        </div>

        {/* Accordions */}
        <div className="border-t border-border">
          {[
            { id: 'description', title: 'Description', content: product.description },
            { id: 'shipping', title: 'Shipping & Returns', content: 'Free standard shipping on all orders over ₹999 across India. Doorstep hassle-free returns and exchanges accepted within 7 days of delivery.' },
            { id: 'details', title: 'Fabric & Care', content: '240+ GSM combed heavyweight cotton. Pre-shrunk fabric for lasting shape. Machine wash cold inside out, tumble dry low or hang dry.' }
          ].map(section => (
            <div key={section.id} className="border-b border-border">
              <button 
                onClick={() => toggleAccordion(section.id)}
                className="w-full py-5 flex items-center justify-between font-extrabold uppercase tracking-wider text-base md:text-lg"
              >
                {section.title}
                <ChevronDown size={20} className={cn("transition-transform duration-300", openAccordion === section.id ? "rotate-180" : "")} />
              </button>
              {openAccordion === section.id && (
                <div className="pb-5 text-gray text-base leading-relaxed whitespace-pre-line font-normal">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
