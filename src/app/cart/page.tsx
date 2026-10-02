'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Container, SectionHeading, EmptyState, Button } from '@/components/ui';
import { useCartStore, useHydration } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Spinner } from '@/components/ui';

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
      <Container className="py-20 flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-20 flex justify-center items-center">
        <EmptyState
          icon={ShoppingBag}
          title="YOUR CART IS EMPTY"
          description="Looks like you haven&apos;t added anything to your cart yet."
          actionLabel="CONTINUE SHOPPING"
          actionHref="/shop"
        />
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-20">
      <div className="mb-10 flex items-center justify-between pb-4 border-b border-border">
        <SectionHeading title="YOUR CART" />
        <span className="text-gray text-sm md:text-base font-bold uppercase tracking-widest">
          {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b-2 border-black text-xs md:text-sm font-bold text-black uppercase tracking-widest">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-6 animate-stagger">
            {cartItems.map((item) => {
              const product = item.product;
              const variant = item.variant;
              const price = variant?.price || 0;
              const itemTotal = price * item.quantity;

              return (
                <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-4 items-start md:items-center py-5 border-b border-border last:border-0 relative group">
                  
                  {/* Mobile Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-0 md:hidden p-2 text-gray hover:text-black transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="col-span-6 flex gap-4 w-full">
                    {/* Product Image */}
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-off-white shrink-0 relative overflow-hidden flex items-center justify-center border border-border">
                      {product?.images && product.images.length > 0 && product.images[0].image_url ? (
                        <img 
                          src={product.images[0].image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-[10px] font-bold tracking-widest text-gray uppercase">AURA</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-1.5">
                      <Link href={`/products/${product?.slug}`} className="font-bold text-base md:text-lg hover:underline line-clamp-2 text-black">
                        {product?.name}
                      </Link>
                      <div className="flex gap-3 text-xs md:text-sm font-medium">
                        {variant?.color && (
                          <span className="text-gray">Color: <strong className="text-black">{variant.color}</strong></span>
                        )}
                        {variant?.size && (
                          <span className="text-gray">Size: <strong className="text-black">{variant.size}</strong></span>
                        )}
                      </div>
                      {variant?.stock_quantity && variant.stock_quantity < item.quantity && (
                         <span className="text-error text-xs font-semibold mt-1">Only {variant.stock_quantity} left in stock</span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center hidden md:block text-base md:text-lg font-black text-black">
                    {formatPrice(price)}
                  </div>

                  {/* Quantity & Mobile Price/Total */}
                  <div className="col-span-2 flex items-center gap-4 w-full md:w-auto md:justify-center mt-4 md:mt-0">
                    <div className="md:hidden w-1/2">
                      <span className="text-base font-black text-black">{formatPrice(price)}</span>
                    </div>

                    <div className="flex items-center border border-border bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2.5 text-gray hover:text-black hover:bg-off-white disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm md:text-base font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (variant?.stock_quantity || 1)}
                        className="p-2.5 text-gray hover:text-black hover:bg-off-white disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total & Desktop Remove Button */}
                  <div className="col-span-2 flex justify-between md:justify-end items-center w-full md:w-auto mt-2 md:mt-0">
                    <span className="font-semibold md:hidden text-gray text-xs uppercase tracking-wider">Item Total: </span>
                    <span className="font-black text-base md:text-lg text-black">{formatPrice(itemTotal)}</span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="hidden md:block ml-5 p-2 text-gray hover:text-error transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-off-white p-6 md:p-8 sticky top-24 border border-border">
            <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase mb-6 border-b border-border pb-4 text-black">
              Order Summary
            </h2>
            
            <div className="space-y-4 text-sm md:text-base mb-6">
              <div className="flex justify-between">
                <span className="text-gray font-medium">Subtotal</span>
                <span className="font-bold text-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray font-medium">Shipping</span>
                <span className="font-bold text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-gray mt-1">
                  Free shipping on orders above {formatPrice(999)}
                </div>
              )}
            </div>
            
            <div className="flex justify-between font-black text-xl md:text-2xl border-t border-border pt-4 mb-8 text-black">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            <Link href="/checkout" className="block w-full mb-4">
              <Button size="lg" className="w-full h-14 text-sm md:text-base font-extrabold tracking-widest">
                PROCEED TO CHECKOUT
              </Button>
            </Link>
            
            <div className="text-center">
              <Link href="/shop" className="text-sm text-gray hover:text-black hover:underline transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
