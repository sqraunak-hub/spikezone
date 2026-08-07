import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { API_BASE_URL } from "../Utils/appConstant";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
      fetchUserProfile: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE_URL}profile/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch profile data");
          }

          const data = await response.json();
          set({ user: data });
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      },
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
