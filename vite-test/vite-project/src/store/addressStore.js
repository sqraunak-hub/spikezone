import { create } from "zustand";
import axios from "axios";

import { API_BASE_URL } from "../Utils/appConstant";

// The address endpoints now require a logged-in caller and scope every row to
// them, so these three calls have to carry the JWT. They did not before, which
// is why the API had to leave them open to anyone.
const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
});

const useAddressStore = create((set) => ({
  addresses: [],
  loading: false,
  error: null,
  selectedAddress: null,

  fetchAddresses: async (userId) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `${API_BASE_URL}addresses/${userId}/`,
        auth()
      );
      set({ addresses: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addAddress: async (addressData) => {
    set({ loading: true });
    try {
      const response = await axios.post(
        `${API_BASE_URL}addresses/`,
        addressData,
        auth()
      );
      set((state) => ({
        addresses: [...state.addresses, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    set({ loading: true });
    try {
      await axios.delete(
        `${API_BASE_URL}addresses/delete/${addressId}/`,
        auth()
      );
      set((state) => ({
        addresses: state.addresses.filter(
          (address) => address.id !== addressId
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setSelectedAddress: (address) => {
    set({ selectedAddress: address });
  },
}));

export default useAddressStore;
