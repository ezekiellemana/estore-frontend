import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Key for localStorage, keep it unique per project
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // Add product to cart (optionally handle variants)
      addToCart: (product, qty, variant = null) => {
        set((state) => {
          // Variant key (like size, color), else just product._id
          const key = variant ? `${product._id}_${variant}` : product._id;
          const exists = state.items.find((i) => i.key === key);

          if (exists) {
            // If exists, just update qty
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          } else {
            // New cart item (variant or not)
            return {
              items: [
                ...state.items,
                {
                  key, // so you can check uniqueness
                  product: product._id,
                  name: product.name,
                  image: product.images?.[0] || '',
                  price: product.price,
                  countInStock: product.stock,
                  qty,
                  variant, // like "M/Black"
                },
              ],
            };
          }
        });
      },
      updateQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, qty } : i
          ),
        })),
      removeFromCart: (key) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        })),
      clearCart: () => set({ items: [] }),
      cartTotal: () =>
        get()
          .items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    {
      name: 'estore-cart-storage', // localStorage key
    }
  )
);

export default useCartStore;
