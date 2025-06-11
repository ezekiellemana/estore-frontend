// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────
      user: null,
      loading: false,
      error: null,

      hydrated: false,        // rehydration complete flag
      sessionExpired: false,  // show “logged out” banner
      skipIdleWarning: false, // suppress pre-logout modal

      // ── Actions ─────────────────────────────────────────────────────────
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
        // clear user + banner flag
        set({ user: null, sessionExpired: false });
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

      setSessionExpired: (val) => set({ sessionExpired: val }),
      setSkipIdleWarning: (val) => set({ skipIdleWarning: val }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => {
          state.hydrated = true;
        }, 0);
      },
    }
  )
);

export default useAuthStore;
