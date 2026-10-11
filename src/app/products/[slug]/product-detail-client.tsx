'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus, ChevronDown, Check, Ruler, X } from 'lucide-react';
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);

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

  const handleAddToCart = () => {
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
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
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
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
      {/* Left: Product Images - Constrained Height to Prevent Viewport Overflow */}
      <div className="w-full lg:w-[46%] xl:w-[44%] shrink-0 flex flex-col gap-2.5">
        <div className="w-full h-[320px] sm:h-[380px] lg:h-[400px] bg-off-white flex items-center justify-center relative border border-border overflow-hidden">
          {selectedImage ? (
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-300" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <span className="text-base font-black tracking-[0.2em] text-black">AURA OUTLET</span>
              <span className="text-[10px] tracking-widest text-gray mt-1">HEAVYWEIGHT MONOCHROME</span>
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <Badge className="bg-black text-white border-black text-[11px] font-bold px-2 py-0.5">
                -{discount}% OFF
              </Badge>
            </div>
          )}
        </div>
        
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(img.image_url)}
                className={cn(
                  "w-14 h-16 shrink-0 bg-off-white border transition-all flex items-center justify-center overflow-hidden",
                  selectedImage === img.image_url ? "border-black ring-1 ring-black" : "border-border hover:border-black/50"
                )}
                aria-label={`View image ${idx + 1}`}
              >
                {img.image_url ? (
                  <img src={img.image_url} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase font-bold text-gray">0{idx + 1}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Info - High Density, Fits Entirely Above The Fold */}
      <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col justify-start">
        {product.category && (
          <div className="text-[10px] font-bold text-gray uppercase tracking-widest mb-0.5">
            {product.category.name}
          </div>
        )}
        <h1 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-black mb-1.5 leading-snug">
          {product.name}
        </h1>
        
        {/* Price Display */}
        <div className="flex items-baseline gap-2.5 mb-3.5">
          {product.sale_price ? (
            <>
              <span className="text-xl md:text-2xl font-black text-black">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-xs sm:text-sm text-gray line-through font-medium">
                {formatPrice(product.base_price)}
              </span>
              <span className="text-[10px] font-bold text-black border border-black/20 px-1.5 py-0.2">
                Save {discount}%
              </span>
            </>
          ) : (
            <span className="text-xl md:text-2xl font-black text-black">
              {formatPrice(product.base_price)}
            </span>
          )}
          <span className="text-[10px] text-gray ml-1">Inclusive of all taxes</span>
        </div>

        {/* Size Selection */}
        <div className="mb-3.5 pb-3 border-b border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-black">
              Select Size: <span className="font-black">{selectedSize || 'None'}</span>
            </span>
            <button 
              type="button"
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="text-[11px] text-gray underline font-medium hover:text-black transition-colors inline-flex items-center gap-1"
            >
              <Ruler className="w-3 h-3" />
              Size Guide
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={cn(
                  "w-9 h-9 md:w-10 md:h-10 border text-xs font-bold transition-all flex items-center justify-center",
                  selectedSize === size 
                    ? "border-black bg-black text-white" 
                    : sizeError 
                    ? "border-red-500 text-red-500 hover:border-black"
                    : "border-border text-black hover:border-black hover:bg-off-white"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="text-red-600 text-[11px] font-bold uppercase tracking-wider mt-1.5">
              Please choose a size to continue
            </p>
          )}

          {/* Inline Size Guide Modal */}
          {showSizeGuide && (
            <div className="mt-2.5 p-2.5 bg-off-white border border-border text-[11px]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold uppercase tracking-wider text-black">Oversized Fit Guide (Inches)</span>
                <button onClick={() => setShowSizeGuide(false)} className="text-gray hover:text-black">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                <div className="font-bold text-gray uppercase">Size</div>
                <div className="font-bold text-gray uppercase">Chest</div>
                <div className="font-bold text-gray uppercase">Length</div>
                <div className="font-bold text-gray uppercase">Shoulder</div>

                <div className="font-semibold">S</div><div>42"</div><div>28"</div><div>20.5"</div>
                <div className="font-semibold">M</div><div>44"</div><div>29"</div><div>21.5"</div>
                <div className="font-semibold">L</div><div>46"</div><div>30"</div><div>22.5"</div>
                <div className="font-semibold">XL</div><div>48"</div><div>31"</div><div>23.5"</div>
                <div className="font-semibold">XXL</div><div>50"</div><div>32"</div><div>24.5"</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls - Space-Saving Multi-Button Layout */}
        <div className="space-y-2 mb-3.5">
          {/* Row 1: Quantity Stepper + Add To Cart */}
          <div className="flex gap-2">
            <div className="flex items-center border border-border h-10 shrink-0">
              <button 
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-full flex items-center justify-center hover:bg-off-white transition-colors text-black"
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <div className="w-8 text-center font-bold text-xs text-black">
                {quantity}
              </div>
              <button 
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-full flex items-center justify-center hover:bg-off-white transition-colors text-black"
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>

            <Button 
              className="flex-1 h-10 text-xs font-black tracking-wider uppercase"
              variant="primary"
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Added to Cart
                </span>
              ) : (
                'Add to Cart'
              )}
            </Button>
          </div>

          {/* Row 2: Buy Now + Wishlist */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 h-10 text-xs font-black tracking-wider uppercase border border-black hover:bg-black hover:text-white transition-colors"
              variant="outline"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
            <button 
              type="button"
              onClick={() => toggleWishlist(product)}
              className="w-10 h-10 border border-border hover:border-black flex items-center justify-center transition-colors shrink-0"
              aria-label={isHydrated && isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart 
                size={16} 
                className={cn(isHydrated && isWishlisted ? "fill-black text-black" : "text-black")} 
              />
            </button>
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-off-white border border-border text-[10px] font-bold text-center text-gray uppercase tracking-wider mb-3.5">
          <div>240+ GSM Cotton</div>
          <div className="border-x border-border">Free Pan-India Delivery</div>
          <div>7-Day Returns</div>
        </div>

        {/* Accordions - Compact */}
        <div className="border-t border-border">
          {[
            { 
              id: 'description', 
              title: 'Description', 
              content: product.description || 'Crafted from heavyweight combed cotton with engineered drop shoulders and modern boxy silhouette.' 
            },
            { 
              id: 'shipping', 
              title: 'Shipping & Delivery', 
              content: 'Free standard shipping on all orders across India. Orders dispatch within 24-48 hours. Estimated delivery: 3–5 business days.' 
            },
            { 
              id: 'details', 
              title: 'Fabric & Care', 
              content: '240+ GSM combed heavyweight cotton. Pre-shrunk fabric for lasting shape. Machine wash cold inside out, tumble dry low or hang dry.' 
            }
          ].map(section => (
            <div key={section.id} className="border-b border-border">
              <button 
                type="button"
                onClick={() => toggleAccordion(section.id)}
                className="w-full py-2.5 flex items-center justify-between font-bold uppercase tracking-wider text-xs text-black"
              >
                {section.title}
                <ChevronDown 
                  size={14} 
                  className={cn("transition-transform duration-200 text-gray", openAccordion === section.id ? "rotate-180 text-black" : "")} 
                />
              </button>
              {openAccordion === section.id && (
                <div className="pb-2.5 text-gray text-[11px] leading-relaxed whitespace-pre-line font-normal">
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
