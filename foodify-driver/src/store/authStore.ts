import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type MemoryStore = Record<string, string>;

type SecureStoreModule = typeof SecureStore & {
  isAvailableAsync?: () => Promise<boolean>;
};

export type AuthState = {
  phoneNumber: string;
  token?: string;
  isOnline: boolean;
  setPhoneNumber: (phone: string) => void;
  authenticate: (phone: string, token: string) => void;
  logout: () => void;
  toggleOnlineStatus: () => void;
};

const inMemoryStorage: MemoryStore = {};

const secureStoreModule = SecureStore as SecureStoreModule;

let secureStoreAvailabilityPromise: Promise<boolean> | null = null;

const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (!secureStoreAvailabilityPromise) {
    const checkAvailability = secureStoreModule.isAvailableAsync;

    if (checkAvailability) {
      secureStoreAvailabilityPromise = checkAvailability().catch((error: unknown) => {
        console.warn('[authStore] Unable to determine secure store availability', error);
        return false;
      });
    } else {
      secureStoreAvailabilityPromise = Promise.resolve(true);
    }
  }

  return secureStoreAvailabilityPromise!;
};

const secureStorage = {
  getItem: async (name: string) => {
    const isAvailable = await isSecureStoreAvailable();

    if (isAvailable) {
      try {
        const value = await secureStoreModule.getItemAsync(name);
        if (value != null) {
          inMemoryStorage[name] = value;
        }
        return value ?? null;
      } catch (error) {
        console.warn(`[authStore] Failed to read key "${name}" from secure store`, error);
      }
    }

    return inMemoryStorage[name] ?? null;
  },
  setItem: async (name: string, value: string) => {
    const isAvailable = await isSecureStoreAvailable();

    if (isAvailable) {
      try {
        await secureStoreModule.setItemAsync(name, value);
        inMemoryStorage[name] = value;
        return;
      } catch (error) {
        console.warn(`[authStore] Failed to persist key "${name}" to secure store`, error);
      }
    }

    inMemoryStorage[name] = value;
  },
  removeItem: async (name: string) => {
    const isAvailable = await isSecureStoreAvailable();

    if (isAvailable) {
      try {
        await secureStoreModule.deleteItemAsync(name);
        delete inMemoryStorage[name];
        return;
      } catch (error) {
        console.warn(`[authStore] Failed to remove key "${name}" from secure store`, error);
      }
    }

    delete inMemoryStorage[name];
  },
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
