import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await axios.get("/orders/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      set({ orders: response.data, loading: false, error: null });
    } catch (error) {
      set({
        orders: [],
        loading: false,
        error: error.response?.data?.message || "Failed to fetch orders",
      });
    }
  },
}));

export default useOrderStore;
