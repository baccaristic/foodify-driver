import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'foodify-driver-device-id';
let cachedDeviceId: string | null = null;

const generateDeviceId = (): string => {
  const randomSegment = () => Math.random().toString(36).substring(2, 10);
  return `${Date.now().toString(36)}-${randomSegment()}-${randomSegment()}`;
};

export const getDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    const storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (storedId) {
      cachedDeviceId = storedId;
      return storedId;
    }
  } catch (error) {
    console.warn('[deviceId] Failed to read device id from secure storage', error);
  }

  const newDeviceId = generateDeviceId();
  cachedDeviceId = newDeviceId;

  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newDeviceId);
  } catch (error) {
    console.warn('[deviceId] Failed to persist device id to secure storage', error);
  }

  return newDeviceId;
};
