import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

import { useAuth } from '../contexts/AuthContext';
import { sendDriverHeartbeat, type DriverHeartbeatPayload } from '../services/driverService';

const HEARTBEAT_INTERVAL_MS = 60000;

type HeartbeatTimer = ReturnType<typeof setInterval> | null;

export const useDriverHeartbeat = (): void => {
  const { accessToken } = useAuth();
  const heartbeatInterval = useRef<HeartbeatTimer>(null);

  useEffect(() => {
    let isMounted = true;

    const clearHeartbeatInterval = () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };

    if (!accessToken) {
      clearHeartbeatInterval();
      return () => {
        isMounted = false;
      };
    }

    const fetchLastKnownLocation = async (): Promise<DriverHeartbeatPayload> => {
      try {
        const lastKnownLocation = await Location.getLastKnownPositionAsync();

        if (lastKnownLocation?.coords) {
          return {
            latitude: lastKnownLocation.coords.latitude,
            longitude: lastKnownLocation.coords.longitude,
          };
        }
      } catch (error) {
        console.debug('[useDriverHeartbeat] Unable to retrieve last known location', error);
      }

      return {};
    };

    const sendHeartbeat = async () => {
      if (!isMounted) {
        return;
      }

      const locationPayload = await fetchLastKnownLocation();

      try {
        await sendDriverHeartbeat(locationPayload);
      } catch (error) {
        console.warn('[useDriverHeartbeat] Failed to send heartbeat', error);
      }
    };

    const startHeartbeat = () => {
      if (heartbeatInterval.current) {
        return;
      }

      void sendHeartbeat();

      heartbeatInterval.current = setInterval(() => {
        void sendHeartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        void sendHeartbeat();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    startHeartbeat();

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      clearHeartbeatInterval();
    };
  }, [accessToken]);
};
