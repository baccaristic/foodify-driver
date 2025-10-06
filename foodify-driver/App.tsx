import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
 <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
