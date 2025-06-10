// src/store/useAuthStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      logout: async () => {
        set({ user: null });
        try {
          // Use dynamic API URL for all environments
          const baseURL = import.meta.env.VITE_API_URL?.trim() || '';
          await fetch(`${baseURL}/api/users/logout`, {
            method: 'POST',
            credentials: 'include', // Cookie-based session logout
          });
        } catch (e) {
          // Ignore errors on logout (user already removed locally)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
