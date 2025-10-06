import React from 'react';

import { useAuth } from '../contexts/AuthContext';
import { DashboardScreen } from '../screens/Home/DashboardScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';

export const AppNavigator: React.FC = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <LoginScreen />;
  }

  return <DashboardScreen />;
};
