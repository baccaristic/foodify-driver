import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebSocketProvider } from './src/contexts/WebSocketContext';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
 <AuthProvider>
  <WebSocketProvider>
  <StatusBar style="dark" />
      <AppNavigator />
  </WebSocketProvider>
    
    </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
