import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from '@/lib/types';
import { mockCartItems } from '@/lib/mock-data';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: mockCartItems,
      addItem: (product: Product, variant: ProductVariant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product_id === product.id && item.variant_id === variant.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          const newItem: CartItem = {
            id: Math.random().toString(36).substring(2, 9),
            cart_id: 'mock_cart_id',
            product_id: product.id,
            variant_id: variant.id,
            quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product,
            variant,
          };

          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },
      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.variant?.price || item.product?.sale_price || item.product?.base_price || 0;
          return total + price * item.quantity;
        }, 0);
      },
      getShipping: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal > 999 ? 0 : 49;
      },
      getTotal: () => {
        return get().getSubtotal() + get().getShipping();
      },
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'aura-cart-storage',
      skipHydration: true,
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : ({} as any)),
    }
  )
);
