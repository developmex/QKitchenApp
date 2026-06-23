import { create } from 'zustand';
import type { User, Company, Role } from '../types';

// SecureStore fallback for web
let SecureStore: any;
try {
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

const safeGet = async (key: string): Promise<string | null> => {
  try {
    if (SecureStore?.getItemAsync) return await SecureStore.getItemAsync(key);
  } catch {}
  return localStorage.getItem(key);
};

const safeSet = async (key: string, value: string): Promise<void> => {
  try {
    if (SecureStore?.setItemAsync) { await SecureStore.setItemAsync(key, value); return; }
  } catch {}
  localStorage.setItem(key, value);
};

const safeDelete = async (key: string): Promise<void> => {
  try {
    if (SecureStore?.deleteItemAsync) { await SecureStore.deleteItemAsync(key); return; }
  } catch {}
  localStorage.removeItem(key);
};

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  company: Company | null;
  companyId: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role;

  setSession: (token: string, refreshToken: string, user: User, company: Company) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const KEYS = {
  ACCESS_TOKEN: 'qkitchen_access_token',
  REFRESH_TOKEN: 'qkitchen_refresh_token',
  USER_DATA: 'qkitchen_user',
  COMPANY_DATA: 'qkitchen_company',
};

function getRole(roleId: number): Role {
  const map: Record<number, Role> = {
    1: 'customer', 2: 'employee', 3: 'director',
    4: 'admin', 5: 'kitchen', 6: 'driver',
  };
  return map[roleId] || 'customer';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  company: null,
  companyId: 1,
  isAuthenticated: false,
  isLoading: true,
  role: 'customer',

  setSession: async (token, refreshToken, user, company) => {
    await safeSet(KEYS.ACCESS_TOKEN, token);
    await safeSet(KEYS.REFRESH_TOKEN, refreshToken);
    await safeSet(KEYS.USER_DATA, JSON.stringify(user));
    await safeSet(KEYS.COMPANY_DATA, JSON.stringify(company));

    set({
      token,
      refreshToken,
      user,
      company,
      companyId: company.id,
      isAuthenticated: true,
      role: getRole(user.role_id),
    });
  },

  logout: async () => {
    await safeDelete(KEYS.ACCESS_TOKEN);
    await safeDelete(KEYS.REFRESH_TOKEN);
    await safeDelete(KEYS.USER_DATA);
    await safeDelete(KEYS.COMPANY_DATA);

    set({
      token: null,
      refreshToken: null,
      user: null,
      company: null,
      isAuthenticated: false,
      role: 'customer',
    });
  },

  loadSession: async () => {
    try {
      const token = await safeGet(KEYS.ACCESS_TOKEN);
      const refreshToken = await safeGet(KEYS.REFRESH_TOKEN);
      const userStr = await safeGet(KEYS.USER_DATA);
      const companyStr = await safeGet(KEYS.COMPANY_DATA);

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        const company = companyStr ? JSON.parse(companyStr) as Company : null;
        set({
          token,
          refreshToken,
          user,
          company,
          companyId: company?.id || 1,
          isAuthenticated: true,
          role: getRole(user.role_id),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
