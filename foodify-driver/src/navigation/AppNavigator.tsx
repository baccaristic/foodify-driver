import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { isAxiosError } from 'axios';

import { useAuth } from '../contexts/AuthContext';
import { DashboardScreen } from '../screens/Home/DashboardScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { checkDriverSession, refreshDriverSession } from '../services/authService';

export const AppNavigator: React.FC = () => {
  const { accessToken, refreshToken, hasHydrated, setTokens, logout } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (!hasHydrated) {
        return;
      }

      if (!accessToken || !refreshToken) {
        if (isMounted) {
          setIsCheckingSession(false);
        }
        return;
      }

      if (isMounted) {
        setIsCheckingSession(true);
      }

      try {
        await checkDriverSession(accessToken);
        if (isMounted) {
          setIsCheckingSession(false);
        }
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 401 || status === 403) {
            try {
              const refreshed = await refreshDriverSession(refreshToken);

              setTokens({
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken ?? refreshToken,
              });

              await checkDriverSession(refreshed.accessToken);

              if (isMounted) {
                setIsCheckingSession(false);
              }

              return;
            } catch (refreshError: unknown) {
              if (isAxiosError(refreshError)) {
                const refreshStatus = refreshError.response?.status;

                if (refreshStatus === 401 || refreshStatus === 403) {
                  logout();
                  if (isMounted) {
                    setIsCheckingSession(false);
                  }
                  return;
                }
              }

              if (isMounted) {
                setIsCheckingSession(false);
              }

              return;
            }
          }
        }

        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, refreshToken, hasHydrated, logout, setTokens]);

  if (!hasHydrated || isCheckingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!accessToken) {
    return <LoginScreen />;
  }

  return <DashboardScreen />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
