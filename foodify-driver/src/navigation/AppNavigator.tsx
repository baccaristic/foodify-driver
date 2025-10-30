import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { isAxiosError } from 'axios';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../contexts/AuthContext';
import { DashboardScreen } from '../screens/Home/DashboardScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { checkDriverSession, refreshDriverSession } from '../services/authService';
import { NavigationContainer } from '@react-navigation/native';
import NotificationsScreen from '../screens/Home/Profile/NotificationsScreen';
import DeleteAccountScreen from '../screens/Home/Profile/DeleteAccountScreen';
import ProfileSettingsScreen from '../screens/Home/Profile/ProfileSettingsScreen';
import { WalletScreen } from '../screens/Home/Profile/WalletScreen';
import { InboxScreen } from '../screens/Home/Profile/InboxScreen';
import { RewardsScreen } from '../screens/Home/Profile/RewardsScreen';
import PayoutsScreen from '../screens/Home/Profile/PayoutsScreen';
import EarningsScreen from '../screens/Home/Profile/EarningsScreen';

const Stack = createStackNavigator();


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

 return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!accessToken ? (
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
            <Stack.Screen name="ProfileSettingsScreen" component={ProfileSettingsScreen} />
            <Stack.Screen name="WalletScreen" component={WalletScreen} />
            <Stack.Screen name="InboxScreen" component={InboxScreen} />
            <Stack.Screen name="EarningsScreen" component={EarningsScreen} />
            <Stack.Screen name="RewardsScreen" component={RewardsScreen} />
            <Stack.Screen name="PayoutsScreen" component={PayoutsScreen} />
            <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
            <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
