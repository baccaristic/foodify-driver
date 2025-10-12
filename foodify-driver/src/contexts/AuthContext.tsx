import React, { createContext, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { logout as logoutRequest } from '../services/authService';
import { AuthState, useAuthStore } from '../store/authStore';

const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

type AuthContextValue = AuthState & {
  logoutAndRedirect: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const state = useAuthStore();

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

  return (
    <AuthContext.Provider value={{ ...state, logoutAndRedirect }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
