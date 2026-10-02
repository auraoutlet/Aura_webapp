'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, MapPin, CreditCard, ShoppingBag, Plus } from 'lucide-react';
import { Container, Button, Input, Badge, Spinner } from '@/components/ui';
import { useCartStore, useHydration } from '@/lib/store';
import { mockAddresses, mockCoupons } from '@/lib/mock-data';
import { formatPrice, cn } from '@/lib/utils';
import { Coupon } from '@/lib/types';

type CheckoutStep = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    mockAddresses.find(a => a.is_default)?.id || mockAddresses[0]?.id || null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const shipping = useCartStore((s) => s.getShipping());
  const clearCart = useCartStore((s) => s.clearCart);
  const isHydrated = useHydration();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = Math.min(
        subtotal * (appliedCoupon.discount_value / 100),
        appliedCoupon.maximum_discount || Infinity
      );
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const total = subtotal - discountAmount + shipping;

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    const coupon = mockCoupons.find(
      c => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (coupon) {
      if (!coupon.is_active) {
        setCouponError('This coupon has expired');
        return;
      }
      if (subtotal < coupon.minimum_order_value) {
        setCouponError(`Minimum order amount is ${formatPrice(coupon.minimum_order_value)}`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    const orderNum = `AO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setTimeout(() => {
      clearCart();
      router.push(`/order-success?order=${orderNum}`);
    }, 1500);
  };

  if (!isHydrated) {
    return (
      <Container className="py-20 flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-20 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray mx-auto mb-6" />
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-4">Your cart is empty</h1>
        <p className="text-gray mb-8">Add some items to your cart before checkout.</p>
        <Button onClick={() => router.push('/shop')} size="lg">CONTINUE SHOPPING</Button>
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-12 text-center">Checkout</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-14 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-border -z-10"></div>
          
          {[
            { num: 1, label: 'Address', icon: MapPin },
            { num: 2, label: 'Review', icon: ShoppingBag },
            { num: 3, label: 'Payment', icon: CreditCard },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            
            return (
              <div key={s.num} className="flex flex-col items-center bg-white px-3 md:px-5">
                <div className={cn(
                  "w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold border-2 mb-2 transition-colors",
                  isActive ? "border-black bg-black text-white shadow-md" : 
                  isCompleted ? "border-black bg-black text-white" : 
                  "border-border bg-white text-gray"
                )}>
                  {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : s.num}
                </div>
                <span className={cn(
                  "text-xs md:text-sm uppercase tracking-widest font-extrabold",
                  isActive || isCompleted ? "text-black" : "text-gray"
                )}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-7 xl:col-span-8">
            
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-black">Select Delivery Address</h2>
                
                {!showAddressForm ? (
                  <>
                    <div className="grid gap-4">
                      {mockAddresses.map((address) => (
                        <div 
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id)}
                          className={cn(
                            "border p-6 cursor-pointer transition-all relative",
                            selectedAddressId === address.id ? "border-black bg-off-white/40 ring-1 ring-black" : "border-border hover:border-black/50"
                          )}
                        >
                          {selectedAddressId === address.id && (
                            <div className="absolute top-6 right-6 text-black bg-white rounded-full p-1 border border-black">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-base md:text-lg text-black">{address.full_name}</span>
                            {address.is_default && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest">Default</Badge>
                            )}
                          </div>
                          
                          <div className="text-sm md:text-base text-gray space-y-1 max-w-[85%] leading-relaxed">
                            <p className="text-black font-medium">{address.address_line_1}</p>
                            {address.address_line_2 && <p>{address.address_line_2}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                            <p className="mt-2 text-black font-medium">Phone: {address.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-8 text-sm md:text-base font-bold tracking-wider"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <Plus className="w-5 h-5" />
                      ADD NEW ADDRESS
                    </Button>

                    <Button 
                      className="w-full mt-8 h-14 text-sm md:text-base font-black tracking-widest" 
                      size="lg"
                      disabled={!selectedAddressId}
                      onClick={() => setStep(2)}
                    >
                      CONTINUE TO REVIEW
                    </Button>
                  </>
                ) : (
                  <div className="border border-border p-6 space-y-6">
                    <h3 className="font-medium uppercase tracking-wider text-sm">New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" placeholder="Jane Doe" required />
                      <Input label="Phone Number" placeholder="10-digit mobile number" required />
                      <div className="md:col-span-2">
                        <Input label="Address Line 1" placeholder="House/Flat No., Building Name" required />
                      </div>
                      <div className="md:col-span-2">
                        <Input label="Address Line 2 (Optional)" placeholder="Street, Sector, Area" />
                      </div>
                      <Input label="City" required />
                      <Input label="State" required />
                      <Input label="Pincode" required />
                      <Input label="Landmark (Optional)" />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <input type="checkbox" id="default" className="w-4 h-4 accent-black" />
                      <label htmlFor="default" className="text-sm">Set as default address</label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddressForm(false)}>
                        CANCEL
                      </Button>
                      <Button className="flex-1" onClick={() => setShowAddressForm(false)}>
                        SAVE ADDRESS
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: REVIEW */}
            {step === 2 && (
              <div className="space-y-10 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                    <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-black">Delivery Address</h2>
                    <button onClick={() => setStep(1)} className="text-sm font-bold text-black hover:underline uppercase tracking-wider">
                      Change
                    </button>
                  </div>
                  
                  {selectedAddressId && (() => {
                    const addr = mockAddresses.find(a => a.id === selectedAddressId);
                    return addr ? (
                      <div className="bg-off-white p-6 text-sm md:text-base border border-border">
                        <p className="font-bold text-base md:text-lg mb-1 text-black">{addr.full_name}</p>
                        <p className="text-gray leading-relaxed">
                          {addr.address_line_1}, {addr.city}, {addr.state} {addr.pincode}
                        </p>
                        <p className="text-black font-semibold mt-2">Phone: {addr.phone}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase mb-6 text-black">Order Items</h2>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4 border border-border p-4 bg-white">
                        <div className="w-24 h-24 md:w-28 md:h-28 bg-off-white shrink-0 flex items-center justify-center overflow-hidden border border-border">
                          {item.product?.images && item.product.images.length > 0 && item.product.images[0].image_url ? (
                            <img 
                              src={item.product.images[0].image_url} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span className="text-[10px] font-bold tracking-widest text-gray uppercase">AURA</span>
                          )}
                        </div>
                        <div className="grow flex flex-col justify-center">
                          <h3 className="font-bold text-base md:text-lg line-clamp-1 text-black">{item.product?.name}</h3>
                          <div className="text-xs md:text-sm text-gray mt-1 font-medium">
                            {item.variant?.color && <span>Color: <strong className="text-black">{item.variant.color}</strong> | </span>}
                            {item.variant?.size && <span>Size: <strong className="text-black">{item.variant.size}</strong></span>}
                          </div>
                          <div className="text-sm md:text-base mt-2 flex justify-between items-center">
                            <span className="text-gray">Qty: <strong className="text-black">{item.quantity}</strong></span>
                            <span className="font-black text-base md:text-lg text-black">{formatPrice((item.variant?.price || 0) * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => setStep(1)} className="font-bold text-xs md:text-sm tracking-wider">
                    BACK TO ADDRESS
                  </Button>
                  <Button size="lg" onClick={() => setStep(3)} className="h-14 px-8 text-sm md:text-base font-black tracking-widest">
                    PROCEED TO PAYMENT
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-black">Payment</h2>
                
                <div className="border border-border p-8 md:p-12 text-center bg-off-white">
                  <CreditCard className="w-14 h-14 mx-auto mb-4 text-black" />
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Simulated Payment</h3>
                  <p className="text-sm md:text-base text-gray mb-8 max-w-md mx-auto">
                    This is a demo store. Click the button below to complete your mock order.
                  </p>
                  
                  <Button 
                    size="lg" 
                    className="w-full md:w-auto px-12 h-16 text-base font-black tracking-widest" 
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'PROCESSING ORDER...' : `PAY ${formatPrice(total)}`}
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={isPlacingOrder} className="font-bold text-xs md:text-sm tracking-wider">
                    BACK TO REVIEW
                  </Button>
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-off-white p-6 md:p-8 sticky top-24 border border-border">
              <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase mb-6 border-b border-border pb-4 text-black">
                Price Details
              </h2>
              
              {/* Coupon Section */}
              {step !== 3 && (
                <div className="mb-6 pb-6 border-b border-border">
                  {!appliedCoupon ? (
                    <div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Coupon Code" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="bg-white font-medium"
                        />
                        <Button variant="outline" onClick={handleApplyCoupon} className="font-bold tracking-wider">Apply</Button>
                      </div>
                      {couponError && <p className="text-error text-xs font-semibold mt-2">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white border border-border p-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-success tracking-wide">{appliedCoupon.code} APPLIED</span>
                        <span className="text-xs text-gray font-medium">
                          {appliedCoupon.discount_type === 'percentage' 
                            ? `${appliedCoupon.discount_value}% OFF` 
                            : `Flat ${formatPrice(appliedCoupon.discount_value)} OFF`}
                        </span>
                      </div>
                      <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs font-bold underline hover:text-error text-gray uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 text-sm md:text-base mb-6">
                <div className="flex justify-between">
                  <span className="text-gray font-medium">Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray font-medium">Shipping</span>
                  <span className="font-bold text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-black text-xl md:text-2xl border-t border-border pt-4 mb-2 text-black">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="text-xs md:text-sm text-success text-right font-bold mt-2">
                  You save {formatPrice(discountAmount)} on this order
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
