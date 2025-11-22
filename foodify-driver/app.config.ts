import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY ??
  process.env.ANDROID_GOOGLE_MAPS_API_KEY ??
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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
    config: googleMapsApiKey
      ? {
          googleMapsApiKey,
        }
      : undefined,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: googleMapsApiKey
      ? {
          googleMaps: {
            apiKey: googleMapsApiKey,
          },
        }
      : undefined,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    baseApiUrl: process.env.BASE_API_URL ?? process.env.EXPO_PUBLIC_BASE_API_URL ?? 'https://apiv3.foodifytn.app',
    websocketUrl:
      process.env.WEBSOCKET_URL ?? process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? 'wss://ws.foodify.example',
  },
};

export default config;
