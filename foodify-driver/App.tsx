import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionHeartbeatManager } from "./src/components/SessionHeartbeatManager";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WebSocketProvider } from "./src/contexts/WebSocketContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./src/types/queryClient";

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <StatusBar style="dark" />
            <SessionHeartbeatManager />
            <AppNavigator />
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;
