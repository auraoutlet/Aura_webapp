import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WishlistItem, Product } from '@/lib/types';
import { mockWishlist } from '@/lib/mock-data';

interface WishlistState {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: mockWishlist || [],
      addItem: (product: Product) => {
        set((state) => {
          if (state.items.some((item) => item.product_id === product.id)) {
            return state;
          }
          const newItem: WishlistItem = {
            id: Math.random().toString(36).substring(2, 9),
            user_id: 'mock_user_id',
            product_id: product.id,
            created_at: new Date().toISOString(),
            product,
          };
          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },
      isWishlisted: (productId: string) => {
        return get().items.some((item) => item.product_id === productId);
      },
      toggleWishlist: (product: Product) => {
        if (get().isWishlisted(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
    }),
    {
      name: 'aura-wishlist-storage',
      skipHydration: true,
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : ({} as any)),
    }
  )
);
