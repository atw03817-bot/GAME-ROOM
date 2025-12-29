import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item._id === product._id);

        // تحديث عداد المبيعات في الخادم في كل مرة
        try {
          await api.post(`/products/${product._id}/add-to-cart`);
        } catch (error) {
          console.error('Error updating sales counter:', error);
          // لا نوقف العملية إذا فشل تحديث العداد
        }

        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item._id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // اسم المفتاح في localStorage
    }
  )
);

export default useCartStore;
