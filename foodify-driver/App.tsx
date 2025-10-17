import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionHeartbeatManager } from './src/components/SessionHeartbeatManager';
import { AuthProvider } from './src/contexts/AuthContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WebSocketProvider>
          <StatusBar style="dark" />
          <SessionHeartbeatManager />
          <AppNavigator />
        </WebSocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
