import Constants from 'expo-constants';

type ExtraConfig = {
  baseApiUrl?: string;
  websocketUrl?: string;
};

const globalObj = globalThis as unknown as {
  process?: { env?: Record<string, string | undefined> };
};

const processEnv = globalObj.process?.env ?? {};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

const fallbackBaseUrl = 'http://localhost:8081';
const fallbackWebSocketUrl = 'wss://ws.foodify.example';

export const ENV = {
  baseApiUrl:
    (processEnv.EXPO_PUBLIC_BASE_API_URL as string | undefined) ?? extra.baseApiUrl ?? fallbackBaseUrl,
  websocketUrl:
    (processEnv.EXPO_PUBLIC_WEBSOCKET_URL as string | undefined) ?? extra.websocketUrl ?? fallbackWebSocketUrl,
};

if (!processEnv.EXPO_PUBLIC_BASE_API_URL && !extra.baseApiUrl) {
  console.warn(
    `ENV: Falling back to default base API URL. Set \`EXPO_PUBLIC_BASE_API_URL\` or the \`extra.baseApiUrl\` field in app config to update it.`,
  );
}

if (!processEnv.EXPO_PUBLIC_WEBSOCKET_URL && !extra.websocketUrl) {
  console.warn(
    `ENV: Falling back to default websocket URL. Set \`EXPO_PUBLIC_WEBSOCKET_URL\` or the \`extra.websocketUrl\` field in app config to update it.`,
  );
}
