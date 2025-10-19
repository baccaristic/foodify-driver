import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { sendDriverHeartbeat, updateDriverLocation } from './driverService';
import { useAuthStore } from '../store/authStore';

export const DRIVER_LOCATION_TASK = 'driver-location-heartbeat-task';

const BACKGROUND_LOCATION_OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 60000,
  distanceInterval: 5,
  pausesUpdatesAutomatically: false,
  showsBackgroundLocationIndicator: true,
  foregroundService: {
    notificationTitle: 'Foodify Driver',
    notificationBody: 'Sharing your live location.',
  },
};

TaskManager.defineTask<Location.LocationObject>(DRIVER_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[BackgroundLocationTask] Location task error', error);
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations;

  if (!locations || locations.length === 0) {
    return;
  }

  const latestLocation = locations[locations.length - 1];
  const coords = latestLocation?.coords;

  if (!coords) {
    return;
  }

  const { user, isOnline, accessToken } = useAuthStore.getState();

  if (user?.id && isOnline) {
    try {
      await updateDriverLocation({
        driverId: user.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (locationError) {
      console.warn('[BackgroundLocationTask] Failed to update driver location', locationError);
    }
  }

  if (accessToken) {
    try {
      await sendDriverHeartbeat({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (heartbeatError) {
      console.warn('[BackgroundLocationTask] Failed to send heartbeat', heartbeatError);
    }
  }
});

export const startBackgroundLocationUpdates = async (): Promise<void> => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);

  if (hasStarted) {
    return;
  }

  try {
    await Location.startLocationUpdatesAsync(
      DRIVER_LOCATION_TASK,
      BACKGROUND_LOCATION_OPTIONS,
    );
  } catch (error) {
    console.warn('[BackgroundLocationTask] Failed to start updates', error);
  }
};

export const stopBackgroundLocationUpdates = async (): Promise<void> => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);

  if (!hasStarted) {
    return;
  }

  try {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  } catch (error) {
    console.warn('[BackgroundLocationTask] Failed to stop updates', error);
  }
};
