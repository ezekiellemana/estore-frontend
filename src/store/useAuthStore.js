import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      hydrated: false, // <-- so you know when zustand rehydration is done

      setUser: (userData) => set({ user: userData }),

      fetchUser: async () => {
        set({ loading: true, error: null });
        try {
          const baseURL = import.meta.env.VITE_API_URL?.trim() || '';
          const res = await fetch(`${baseURL}/api/users/profile`, {
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Not authenticated');
          const user = await res.json();
          set({ user, error: null });
        } catch (e) {
          set({ user: null, error: e.message || 'Auth error' });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ user: null });
        try {
          const baseURL = import.meta.env.VITE_API_URL?.trim() || '';
          await fetch(`${baseURL}/api/users/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => {
          // Wait for hydration, then mark as hydrated
          state.hydrated = true;
        }, 0);
      },
    }
  )
);

export default useAuthStore;
