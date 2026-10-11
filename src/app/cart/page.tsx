'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Container, EmptyState, Button, Spinner } from '@/components/ui';
import { useCartStore, useHydration } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items: cartItems, removeItem, updateQuantity } = useCartStore();
  const subtotal = useCartStore((s) => s.getSubtotal());
  const shipping = useCartStore((s) => s.getShipping());
  const total = useCartStore((s) => s.getTotal());
  const isHydrated = useHydration();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  if (!isHydrated) {
    return (
      <Container className="py-16 flex justify-center items-center min-h-[40vh]">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-16 flex justify-center items-center">
        <EmptyState
          icon={ShoppingBag}
          title="YOUR CART IS EMPTY"
          description="Looks like you haven't added anything to your cart yet."
          actionLabel="CONTINUE SHOPPING"
          actionHref="/shop"
        />
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-6 flex items-center justify-between pb-3 border-b border-border">
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black">Your Cart</h1>
        <span className="text-gray text-xs font-bold uppercase tracking-widest">
          {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b-2 border-black text-xs font-bold text-black uppercase tracking-widest">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-3">
            {cartItems.map((item) => {
              const product = item.product;
              const variant = item.variant;
              const price = Number(variant?.price || product?.sale_price || product?.base_price || 0);
              const itemTotal = price * item.quantity;

              return (
                <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center p-3.5 border border-border bg-white relative">
                  
                  {/* Mobile Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 md:hidden p-1 text-gray hover:text-black transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="col-span-6 flex gap-3 w-full">
                    {/* Product Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-off-white shrink-0 relative overflow-hidden flex items-center justify-center border border-border">
                      {product?.images && product.images.length > 0 && product.images[0].image_url ? (
                        <img 
                          src={product.images[0].image_url} 
                          alt={product.name || 'Aura Item'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-[10px] font-bold tracking-widest text-gray uppercase">AURA</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-1">
                      <Link href={`/products/${product?.slug}`} className="font-bold text-xs sm:text-sm hover:underline line-clamp-1 text-black">
                        {product?.name}
                      </Link>
                      <div className="flex gap-2 text-[11px] font-medium text-gray">
                        {variant?.color && (
                          <span>Color: <strong className="text-black">{variant.color}</strong></span>
                        )}
                        {variant?.size && (
                          <span>Size: <strong className="text-black">{variant.size}</strong></span>
                        )}
                      </div>
                      {variant?.stock_quantity && variant.stock_quantity < item.quantity && (
                         <span className="text-error text-[10px] font-semibold">Only {variant.stock_quantity} left</span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center hidden md:block text-xs sm:text-sm font-black text-black">
                    {formatPrice(price)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex items-center gap-3 w-full md:w-auto md:justify-center mt-2 md:mt-0">
                    <div className="md:hidden">
                      <span className="text-xs font-black text-black">{formatPrice(price)}</span>
                    </div>

                    <div className="flex items-center border border-border bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-gray hover:text-black hover:bg-off-white disabled:opacity-40 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (variant?.stock_quantity || 99)}
                        className="p-1.5 text-gray hover:text-black hover:bg-off-white disabled:opacity-40 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total & Desktop Remove Button */}
                  <div className="col-span-2 flex justify-between md:justify-end items-center w-full md:w-auto mt-1 md:mt-0">
                    <span className="font-semibold md:hidden text-gray text-[11px] uppercase tracking-wider">Total: </span>
                    <span className="font-black text-xs sm:text-sm text-black">{formatPrice(itemTotal)}</span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="hidden md:block ml-4 p-1.5 text-gray hover:text-error transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-off-white p-4 sm:p-5 sticky top-20 border border-border">
            <h2 className="text-sm md:text-base font-black tracking-wide uppercase mb-3.5 border-b border-border pb-2.5 text-black">
              Order Summary
            </h2>
            
            <div className="space-y-2 text-xs sm:text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray font-medium">Subtotal</span>
                <span className="font-bold text-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray font-medium">Shipping</span>
                <span className="font-bold text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <div className="text-[10px] text-gray mt-0.5">
                  Free shipping on orders above {formatPrice(999)}
                </div>
              )}
            </div>
            
            <div className="flex justify-between font-black text-base border-t border-border pt-3 mb-5 text-black">
              <span className="uppercase tracking-wider">Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            <Link href="/checkout" className="block w-full mb-3">
              <Button size="lg" className="w-full h-11 text-xs md:text-sm font-black tracking-widest uppercase">
                Proceed to Checkout
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            
            <div className="text-center">
              <Link href="/shop" className="text-xs text-gray hover:text-black hover:underline transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
