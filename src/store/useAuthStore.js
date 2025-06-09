import {create} from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (jwt) => {
        set({ token: jwt });
        localStorage.setItem('token', jwt);
      },
      setUser: (userData) => set({ user: userData }),
      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;
