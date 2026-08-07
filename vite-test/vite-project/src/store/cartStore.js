import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // ✅ Add to Cart with Custom Quantity
      addToCart: (product, qty = 1) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );
          const price = Number(product.price);
          let updatedCart;

          if (existingItem) {
            const newQuantity = existingItem.quantity + qty;
            const newTotal = newQuantity * price;

            updatedCart = state.cartItems.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: newQuantity,
                    productTotal: newTotal,
                  }
                : item
            );
          } else {
            updatedCart = [
              ...state.cartItems,
              {
                ...product,
                quantity: qty,
                productTotal: price * qty,
                price,
              },
            ];
          }

          return { cartItems: updatedCart };
        });
      },

      // ✅ Update quantity directly
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity < 1) return state;

          const updatedCart = state.cartItems.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity,
                  productTotal: quantity * item.price,
                }
              : item
          );

          return { cartItems: updatedCart };
        }),

      // ✅ Remove item from cart
      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== productId),
        })),

      // ✅ Clear all cart items
      clearCart: () => set({ cartItems: [] }),

      // ✅ Total amount
      getTotalAmount: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.productTotal,
          0
        );
      },

      // ✅ Total items
      getTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useCartStore;
