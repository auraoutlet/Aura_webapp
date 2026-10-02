'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, MapPin, CreditCard, ShoppingBag, Plus, AlertCircle } from 'lucide-react';
import { Container, Button, Input, Badge, Spinner } from '@/components/ui';
import { useCartStore, useHydration } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';
import { Coupon, Address } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { createOrderInDb } from '@/lib/services/orders';

type CheckoutStep = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  // New Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const shipping = useCartStore((s) => s.getShipping());
  const clearCart = useCartStore((s) => s.clearCart);
  const isHydrated = useHydration();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  // Check auth and load addresses from Supabase
  useEffect(() => {
    async function loadUserAndAddresses() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/login?redirect=/checkout');
          return;
        }

        setCurrentUser(user);

        // Fetch user addresses from live database
        const { data: addrData, error: addrError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (!addrError && addrData) {
          setAddresses(addrData as Address[]);
          const defaultAddr = addrData.find((a: any) => a.is_default) || addrData[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch (err) {
        console.error('Error loading checkout user/addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    }

    loadUserAndAddresses();
  }, [router]);
  
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

  const total = Math.max(0, subtotal - discountAmount + shipping);

  // Apply Coupon via Supabase
  const handleApplyCoupon = async () => {
    setCouponError('');
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsApplyingCoupon(true);
    try {
      const supabase = createClient();
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error || !coupon) {
        setCouponError('Invalid coupon code');
        return;
      }

      if (!coupon.is_active) {
        setCouponError('This coupon is no longer active');
        return;
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        setCouponError('This coupon has expired');
        return;
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        setCouponError('This coupon usage limit has been reached');
        return;
      }

      if (subtotal < (coupon.minimum_order_value || 0)) {
        setCouponError(`Minimum order amount is ${formatPrice(coupon.minimum_order_value)}`);
        return;
      }

      setAppliedCoupon(coupon as Coupon);
      setCouponCode('');
    } catch (err) {
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Save New Address to Supabase
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setAddressError('');
    setIsSavingAddress(true);

    try {
      const supabase = createClient();

      if (newIsDefault && addresses.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', currentUser.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: currentUser.id,
          full_name: newFullName.trim(),
          phone: newPhone.trim(),
          address_line_1: newAddressLine1.trim(),
          address_line_2: newAddressLine2.trim() || null,
          city: newCity.trim(),
          state: newState.trim(),
          pincode: newPincode.trim(),
          is_default: newIsDefault || addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedList = [data as Address, ...addresses.map(a => newIsDefault ? { ...a, is_default: false } : a)];
        setAddresses(updatedList);
        setSelectedAddressId(data.id);
        setShowAddressForm(false);
        // Reset form
        setNewFullName('');
        setNewPhone('');
        setNewAddressLine1('');
        setNewAddressLine2('');
        setNewCity('');
        setNewState('');
        setNewPincode('');
        setNewIsDefault(false);
      }
    } catch (err: any) {
      setAddressError(err.message || 'Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Place Order to Live Supabase
  const handlePlaceOrder = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!selectedAddressId) {
      setOrderError('Please select a delivery address');
      setStep(1);
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    setOrderError('');

    try {
      const orderItemsInput = cartItems.map(item => {
        const unitPrice = Number(item.variant?.price || item.product?.sale_price || item.product?.base_price || 0);
        return {
          productId: item.product_id,
          variantId: item.variant_id,
          productName: item.product?.name || 'Aura Apparel',
          size: item.variant?.size || 'Standard',
          color: item.variant?.color || 'Black',
          unitPrice,
          quantity: item.quantity,
          totalPrice: unitPrice * item.quantity,
        };
      });

      const paymentMethodLabel = 
        paymentMethod === 'card' ? 'Credit / Debit Card' :
        paymentMethod === 'upi' ? 'UPI / NetBanking' : 'Cash on Delivery';

      const result = await createOrderInDb({
        userId: currentUser.id,
        addressId: selectedAddressId,
        subtotal,
        discount: discountAmount,
        shippingFee: shipping,
        totalAmount: total,
        items: orderItemsInput,
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethodLabel,
      });

      if (!result.success || !result.orderNumber) {
        throw new Error(result.error || 'Failed to place order');
      }

      // Clear local cart
      clearCart();

      // Navigate to order success with live order data
      router.push(`/order-success?order=${encodeURIComponent(result.orderNumber)}&id=${encodeURIComponent(result.orderId!)}`);
    } catch (err: any) {
      setOrderError(err.message || 'Error occurred while placing your order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (!isHydrated || isLoadingAddresses) {
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
        <p className="text-gray mb-8">Add items to your cart before proceeding to checkout.</p>
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

        {orderError && (
          <div className="mb-8 p-4 bg-red-50 border border-error/30 text-error text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-7 xl:col-span-8">
            
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-black">Select Delivery Address</h2>
                
                {!showAddressForm ? (
                  <>
                    {addresses.length === 0 ? (
                      <div className="border border-border p-8 text-center bg-off-white/40">
                        <MapPin className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm font-bold uppercase tracking-wider text-black mb-1">No Saved Addresses</p>
                        <p className="text-xs text-gray-500 mb-6">Please add a shipping address to proceed with checkout.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddressForm(true)}
                          className="font-bold text-xs uppercase tracking-wider gap-2 mx-auto"
                        >
                          <Plus size={16} />
                          Add Shipping Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {addresses.map((address) => (
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

                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-8 text-sm md:text-base font-bold tracking-wider"
                          onClick={() => setShowAddressForm(true)}
                        >
                          <Plus className="w-5 h-5" />
                          ADD NEW ADDRESS
                        </Button>
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <Button 
                        className="w-full mt-8 h-14 text-sm md:text-base font-black tracking-widest" 
                        size="lg"
                        disabled={!selectedAddressId}
                        onClick={() => setStep(2)}
                      >
                        CONTINUE TO REVIEW
                      </Button>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleSaveAddress} className="border border-border p-6 space-y-6 bg-white">
                    <h3 className="font-bold uppercase tracking-wider text-sm text-black">New Delivery Address</h3>

                    {addressError && (
                      <div className="p-3 bg-red-50 border border-error/30 text-error text-xs font-bold">
                        {addressError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="Full Name" 
                        placeholder="John Doe" 
                        required 
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                      />
                      <Input 
                        label="Phone Number" 
                        placeholder="10-digit mobile number" 
                        required 
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                      <div className="md:col-span-2">
                        <Input 
                          label="Address Line 1" 
                          placeholder="House/Flat No., Building Name" 
                          required 
                          value={newAddressLine1}
                          onChange={(e) => setNewAddressLine1(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input 
                          label="Address Line 2 (Optional)" 
                          placeholder="Street, Sector, Area" 
                          value={newAddressLine2}
                          onChange={(e) => setNewAddressLine2(e.target.value)}
                        />
                      </div>
                      <Input 
                        label="City" 
                        required 
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                      />
                      <Input 
                        label="State" 
                        required 
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                      />
                      <Input 
                        label="Pincode" 
                        required 
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <input 
                        type="checkbox" 
                        id="default" 
                        className="w-4 h-4 accent-black cursor-pointer"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                      />
                      <label htmlFor="default" className="text-sm font-medium cursor-pointer">Set as default address</label>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-border">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setShowAddressForm(false)}
                        disabled={isSavingAddress}
                      >
                        CANCEL
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={isSavingAddress}
                      >
                        {isSavingAddress ? 'SAVING...' : 'SAVE ADDRESS'}
                      </Button>
                    </div>
                  </form>
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
                    const addr = addresses.find(a => a.id === selectedAddressId);
                    return addr ? (
                      <div className="bg-off-white p-6 text-sm md:text-base border border-border">
                        <p className="font-bold text-base md:text-lg mb-1 text-black">{addr.full_name}</p>
                        <p className="text-gray leading-relaxed">
                          {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}, {addr.city}, {addr.state} {addr.pincode}
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
                              alt={item.product?.name || 'Aura Item'} 
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
                            <span className="font-black text-base md:text-lg text-black">{formatPrice((item.variant?.price || item.product?.base_price || 0) * item.quantity)}</span>
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
                <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-black">Payment Method</h2>
                
                <div className="space-y-4">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                    { id: 'upi', label: 'UPI / Net Banking', desc: 'Google Pay, PhonePe, Paytm, All Banks' },
                    { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay with cash at your doorstep' },
                  ].map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        "border p-5 cursor-pointer flex items-center justify-between transition-all",
                        paymentMethod === method.id ? "border-black bg-off-white/40 ring-1 ring-black" : "border-border hover:border-black/50"
                      )}
                    >
                      <div>
                        <p className="font-bold text-base text-black uppercase tracking-wider">{method.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        paymentMethod === method.id ? "border-black bg-black" : "border-gray-300"
                      )}>
                        {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-border p-6 bg-off-white text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Click below to confirm and place your order</p>
                  <Button 
                    size="lg" 
                    className="w-full h-16 text-base font-black tracking-widest" 
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'PLACING ORDER...' : `CONFIRM & PAY ${formatPrice(total)}`}
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

          {/* Sidebar: Price Details */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-off-white p-6 md:p-8 sticky top-24 border border-border">
              <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase mb-6 border-b border-border pb-4 text-black">
                Price Details
              </h2>
              
              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b border-border">
                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="ENTER COUPON CODE" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="rounded-none uppercase tracking-wider text-xs md:text-sm"
                        disabled={isApplyingCoupon}
                      />
                      <Button 
                        variant="primary" 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="shrink-0 font-black tracking-wider text-xs px-5"
                      >
                        {isApplyingCoupon ? '...' : 'APPLY'}
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-error mt-2 font-bold">{couponError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-black text-white p-4">
                    <div>
                      <span className="font-black text-xs md:text-sm uppercase tracking-widest block">{appliedCoupon.code} APPLIED</span>
                      <span className="text-[11px] text-gray-300 font-medium">You saved {formatPrice(discountAmount)}</span>
                    </div>
                    <button 
                      onClick={() => setAppliedCoupon(null)} 
                      className="text-xs uppercase font-extrabold hover:text-red-400 tracking-wider transition-colors ml-2"
                    >
                      REMOVE
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 text-sm md:text-base font-medium">
                <div className="flex justify-between">
                  <span className="text-gray">Bag Total</span>
                  <span className="font-bold text-black">{formatPrice(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Discount</span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray">Shipping</span>
                  <span className="font-bold text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                
                <div className="border-t border-border pt-4 flex justify-between items-baseline font-black text-lg md:text-xl text-black">
                  <span className="uppercase tracking-wider">Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
