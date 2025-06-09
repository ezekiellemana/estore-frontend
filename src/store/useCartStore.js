import {create} from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  addToCart: (product, qty) =>
    set((state) => {
      const exists = state.items.find((i) => i.product === product._id);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.product === product._id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      } else {
        return {
          items: [
            ...state.items,
            {
              product: product._id,
              name: product.name,
              image: product.images[0] || '',
              price: product.price,
              countInStock: product.stock,
              qty,
            },
          ],
        };
      }
    }),
  updateQty: (productId, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product === productId ? { ...i, qty } : i
      ),
    })),
  removeFromCart: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product !== productId),
    })),
  clearCart: () => set({ items: [] }),
}));

export default useCartStore;
