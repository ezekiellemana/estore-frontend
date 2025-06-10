import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      logout: async () => {
        // Clear user state
        set({ user: null });
        // Make sure backend session is killed too
        try {
          await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/logout`, {
            method: 'POST',
            credentials: 'include', // This ensures cookie/session is sent
          });
        } catch (e) {
          // Fail silently, we're logging out either way
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
