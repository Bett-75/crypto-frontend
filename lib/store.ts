import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: string;
  twoFaEnabled?: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: Cookies.get('token') ?? null,

  setAuth: (user, token) => {
    Cookies.set('token', token, { expires: 7, sameSite: 'strict' });
    set({ user, token });
  },

  logout: () => {
    Cookies.remove('token');
    set({ user: null, token: null });
    window.location.href = '/auth/login';
  },

  isAdmin: () => get().user?.role === 'admin',
}));
