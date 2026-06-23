import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, Company, Role } from '../types';

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
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
    await SecureStore.setItemAsync(KEYS.COMPANY_DATA, JSON.stringify(company));

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
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER_DATA);
    await SecureStore.deleteItemAsync(KEYS.COMPANY_DATA);

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
      const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
      const userStr = await SecureStore.getItemAsync(KEYS.USER_DATA);
      const companyStr = await SecureStore.getItemAsync(KEYS.COMPANY_DATA);

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
