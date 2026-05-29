import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;        // cartItemId
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  unit: string;
  stock: number;
}

export interface AddCartItemInput {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  unit: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const createCartItemId = (item: Pick<AddCartItemInput, 'productId' | 'price' | 'unit'>) =>
  `${item.productId}::${item.price}::${item.unit}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const cartItemId = createCartItemId(item);
        const existingItem = items.find((i) => i.id === cartItemId);
        
        if (existingItem) {
          // Increase quantity without stock limit for pre-orders
          const newQuantity = existingItem.quantity + item.quantity;
          set({
            items: items.map((i) =>
              i.id === cartItemId ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                id: cartItemId,
              },
            ],
          });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: quantity } : i
          ),
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState?.items) return persistedState;

        return {
          ...persistedState,
          items: persistedState.items.map((item: any) => {
            const productId = item.productId || item.id;
            return {
              ...item,
              productId,
              id: createCartItemId({
                productId,
                price: item.price,
                unit: item.unit,
              }),
            };
          }),
        };
      },
    }
  )
);
