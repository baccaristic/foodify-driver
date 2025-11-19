import React, { createContext, useCallback, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { logout as logoutRequest } from '../services/authService';
import { AuthState, useAuthStore } from '../store/authStore';
import { DriverUser } from '../types/auth';

const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

type AuthContextValue = AuthState & {
  logoutAndRedirect: () => Promise<void>;
  updateUser: (nextUser: DriverUser) => Promise<void>;

};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const state = useAuthStore();
  const [user,setUser] = useState<DriverUser | null>(null);

  const persistUser = useCallback(async (nextUser: DriverUser | null) => {
    if (nextUser) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  }, []);

  const logoutAndRedirect = async () => {
    try {
      const refreshTokenValue = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshTokenValue) {
        await logoutRequest({ refreshToken: refreshTokenValue });
      }

      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      state.logout();

      console.log('Logout successful!');
    } catch (error) {
      console.warn('Logout failed!', error);
    }
  };
  const updateUser = useCallback(
    async (nextUser: DriverUser) => {
      setUser(nextUser);
      await persistUser(nextUser);
    },
    [persistUser],
  );

  return (
    <AuthContext.Provider value={{ ...state, updateUser,logoutAndRedirect }}>
      {children}
    </AuthContext.Provider>
  ); 
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
