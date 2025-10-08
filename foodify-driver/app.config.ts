import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'foodify-driver',
  slug: 'foodify-driver',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  plugins: ["expo-secure-store"],
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    baseApiUrl: process.env.BASE_API_URL ?? process.env.EXPO_PUBLIC_BASE_API_URL ?? 'http://172.20.10.3:8081',
    websocketUrl:
      process.env.WEBSOCKET_URL ?? process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? 'wss://ws.foodify.example',
  },
};

export default config;
