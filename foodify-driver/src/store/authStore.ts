import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthState = {
  phoneNumber: string;
  token?: string;
  isOnline: boolean;
  setPhoneNumber: (phone: string) => void;
  authenticate: (phone: string, token: string) => void;
  logout: () => void;
  toggleOnlineStatus: () => void;
};

const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>(
  persist(
    (
      set: (
        updater: (state: AuthState) => AuthState | Partial<AuthState>,
      ) => void,
    ) => ({
      phoneNumber: '',
      token: undefined,
      isOnline: false,
      setPhoneNumber: (phoneNumber: string) => set(() => ({ phoneNumber })),
      authenticate: (phoneNumber: string, token: string) => set(() => ({ phoneNumber, token })),
      logout: () => set(() => ({ token: undefined, isOnline: false, phoneNumber: '' })),
      toggleOnlineStatus: () => set((state) => ({ isOnline: !state.isOnline })),
    }),
    {
      name: 'foodify-driver-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state: AuthState) => ({
        phoneNumber: state.phoneNumber,
        token: state.token,
        isOnline: state.isOnline,
      }),
    },
  ),
);
